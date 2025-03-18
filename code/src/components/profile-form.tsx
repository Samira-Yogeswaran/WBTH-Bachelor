'use client'

import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { profileFormSchema } from '@/lib/validations'
import { User } from 'next-auth'
import { editProfile } from '@/actions/auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm({ user }: { user: User }) {
	const [_user, setUser] = useState(user)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			firstName: user.firstName,
			lastName: user.lastName,
		},
	})

	async function onSubmit(values: ProfileFormValues) {
		console.log(values)
		setIsLoading(true)
		setError(null)
		try {
			const { error } = await editProfile(values)
			if (error) {
				setError(error)
				throw new Error(error)
			}

			setUser((prev) => ({
				...prev,
				firstName: values.firstName,
				lastName: values.lastName,
			}))
		} catch (error) {
			console.error(error)
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError('Ein unbekannter Fehler ist aufgetreten.')
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					Verwalten Sie Ihre Kontoeinstellungen und Profilinformationen.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{error && (
					<Alert variant="destructive">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertTitle>Fehler</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				<div className="flex items-center space-x-4">
					<Avatar className="h-20 w-20">
						<AvatarFallback>{_user.name?.charAt(0) || 'U'}</AvatarFallback>
					</Avatar>
					<div>
						<h2 className="text-2xl font-bold">
							{_user.firstName} {_user.lastName}
						</h2>
						<p className="text-muted-foreground">{_user.email}</p>
					</div>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Vorname</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nachname</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Wird aktualisiert...' : 'Profil aktualisieren'}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
