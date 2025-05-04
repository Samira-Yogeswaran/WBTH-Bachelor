'use client'

import { useEffect, useState } from 'react'
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
import { Module } from '@/types/general'
import { supabase } from '@/lib/supabase/client'
import { createPost } from '@/actions/post'
import { FileUploader } from '@/components/file-uploader'
import { useAuth } from '@/hooks/use-auth'

export default function CreatePost() {
	const router = useRouter()
	const { user } = useAuth()
	const [modules, setModules] = useState<Module[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [createError, setCreateError] = useState<string | null>(null)

	useEffect(() => {
		const fetchModules = async () => {
			const { data } = await supabase.from('modules').select('id, name')
			if (data) {
				setModules(data)
			}
		}

		fetchModules()
	}, [])

	const form = useForm<z.infer<typeof postSchema>>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: '',
			module: '',
			files: [],
		},
	})

	async function onSubmit(values: z.infer<typeof postSchema>) {
		setIsSubmitting(true)
		setCreateError(null)

		const { error } = await createPost(values)
		if (error) {
			setCreateError(error)
			setIsSubmitting(false)
			return
		}

		setIsSubmitting(false)
		router.push(`/`)
	}

	return (
		<div className="px-8 py-6 max-w-[1000px] mx-auto">
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">Neuer Beitrag</h1>
					<p className="text-muted-foreground">
						Teilen Sie Ihre Notizen, Anleitungen und Ressourcen mit der Community
					</p>
				</div>

				{createError && (
					<div className="bg-destructive/10 text-destructive p-3 rounded-md border border-destructive">
						{createError}
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
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<SelectTrigger className="w-full">
												<SelectValue
													placeholder={
														modules.length === 0 ? 'Module werden geladen...' : 'Modul auswählen'
													}
												/>
											</SelectTrigger>
											<SelectContent>
												{modules.map((module) => (
													<SelectItem key={module.id} value={module.id}>
														{module.name}
													</SelectItem>
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
							{isSubmitting ? 'Wird hochgeladen...' : 'Materialien hochladen'}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	)
}
