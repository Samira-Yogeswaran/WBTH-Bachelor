'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { postSchema } from '@/lib/validations'
import { Module, Post } from '@/types/general'
import { supabaseWithAuth } from '@/lib/supabase/client'
import { getPost, updatePost } from '@/actions/post'
import { FileUploader } from '@/components/file-uploader'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'
import { groupModulesByType } from '@/lib/utils'

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
	const { id } = React.use(params)
	const router = useRouter()
	const { user } = useAuth()
	const [modules, setModules] = useState<Module[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [, setPost] = useState<Post | null>(null)

	const form = useForm<z.infer<typeof postSchema>>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: '',
			module: '',
			files: [],
		},
	})

	useEffect(() => {
		const fetchModules = async () => {
			const supabase = await supabaseWithAuth()
			const { data } = await supabase.from('modules').select('id, name, etcs_credits, type')
			if (data) {
				setModules(data)
			}
		}

		fetchModules()
	}, [])

	useEffect(() => {
		const fetchPost = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const result = await getPost(id)

				if (!result.success || !result.data) {
					setError(result.error || 'Beitrag konnte nicht geladen werden')
					setIsLoading(false)
					return
				}

				setPost(result.data)

				// Get module ID from name
				const moduleItem = modules.find((m) => m.name === result.data.module)

				// Format files for form
				const formattedFiles = await Promise.all(
					result.data.files.map(async (file) => {
						const response = await fetch(file.file_url)
						const blob = await response.blob()
						return {
							id: file.id,
							file: new File([blob], file.file_name, { type: file.file_type }),
						}
					})
				)

				form.reset({
					title: result.data.title,
					module: moduleItem?.id || '',
					files: formattedFiles,
				})

				setIsLoading(false)
			} catch (err) {
				console.error('Error fetching post:', err)
				setError('Ein Fehler ist beim Laden des Beitrags aufgetreten')
				setIsLoading(false)
			}
		}

		if (modules.length > 0) {
			fetchPost()
		}
	}, [id, modules, form])

	async function onSubmit(values: z.infer<typeof postSchema>) {
		setIsSubmitting(true)
		setError(null)

		try {
			const result = await updatePost(id, values)

			if (!result.success) {
				setError(result.error || 'Ein Fehler ist beim Aktualisieren des Beitrags aufgetreten')
				setIsSubmitting(false)
				return
			}

			setIsSubmitting(false)
			router.push('/')
		} catch (err) {
			console.error('Error updating post:', err)
			setError('Ein unerwarteter Fehler ist aufgetreten')
			setIsSubmitting(false)
		}
	}

	const groupedModules = groupModulesByType(modules)
	const sortedTypes = Object.keys(groupedModules).sort()

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-10">
				<Loader2 className="h-6 w-6 mr-2 animate-spin" />
				<span>Beitrag wird geladen...</span>
			</div>
		)
	}

	if (error) {
		return <div className="text-center text-red-500 py-4">{error}</div>
	}

	return (
		<div className="px-8 py-6 max-w-[1000px] mx-auto">
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">Beitrag bearbeiten</h1>
					<p className="text-muted-foreground">Aktualisieren Sie Ihre geteilten Materialien</p>
				</div>

				{error && (
					<div className="bg-destructive/10 text-destructive p-3 rounded-md border border-destructive">
						{error}
					</div>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Titel</FormLabel>
									<FormControl>
										<Input placeholder="z.B. Mathematik-Lernhilfe" {...field} />
									</FormControl>
									<FormDescription>
										Geben Sie Ihrem Upload einen klaren, beschreibenden Titel
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="module"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Module</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="w-full">
												<SelectValue
													placeholder={
														modules.length === 0 ? 'Module werden geladen...' : 'Modul auswählen'
													}
												/>
											</SelectTrigger>
											<SelectContent>
												{sortedTypes.map((type) => (
													<div key={type}>
														<div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
															{type}
														</div>
														{groupedModules[type].map((module) => (
															<SelectItem key={module.id} value={module.id}>
																{module.name}
																<span className="ml-2 text-xs text-muted-foreground">
																	({module.etcs_credits} ECTS)
																</span>
															</SelectItem>
														))}
													</div>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormDescription>
										Wählen Sie die relevanteste Kategorie für Ihre Materialien
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="files"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Dateien</FormLabel>
									<FormControl>
										{user ? (
											<FileUploader value={field.value} onChange={field.onChange} />
										) : (
											<div className="flex flex-col space-y-2">
												<div className="h-54 w-full animate-pulse rounded-md bg-muted"></div>
											</div>
										)}
									</FormControl>
									<FormDescription>
										Laden Sie PDFs, Dokumente, Präsentationen oder Bilder hoch (max. 10MB pro Datei)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" disabled={isSubmitting} className="w-full">
							{isSubmitting ? 'Wird aktualisiert...' : 'Beitrag aktualisieren'}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	)
}
