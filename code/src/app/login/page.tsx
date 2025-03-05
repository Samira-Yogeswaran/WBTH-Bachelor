'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { loginSchema } from '@/lib/validations'

export default function LoginPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isLoading, setIsLoading] = useState(false)
	const [authError, setAuthError] = useState<string | null>(null)

	// Get error message from URL if it exists
	const error = searchParams.get('error')

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		setIsLoading(true)
		setAuthError(null)

		try {
			const result = await signIn('credentials', {
				email: values.email,
				password: values.password,
				redirect: false,
			})

			if (result?.error) {
				setAuthError('Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.')
			} else {
				router.push('/')
				router.refresh()
			}
		} catch (err) {
			console.error(err)
			setAuthError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="container flex h-screen w-screen flex-col items-center justify-center">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Willkommen zurück</h1>
					<p className="text-sm text-muted-foreground">
						Geben Sie Ihre Anmeldedaten ein, um sich in Ihrem Konto anzumelden
					</p>
				</div>

				{(error || authError) && (
					<Alert variant="destructive">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertDescription>
							{error === 'CredentialsSignin'
								? 'Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.'
								: authError || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'}
						</AlertDescription>
					</Alert>
				)}

				<div className="grid gap-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-Mail</FormLabel>
										<FormControl>
											<Input placeholder="name@example.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Passwort</FormLabel>
										<FormControl>
											<Input type="password" placeholder="••••••••" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
							</Button>
						</form>
					</Form>
				</div>
				<p className="px-8 text-center text-sm text-muted-foreground">
					Noch kein Konto?{' '}
					<Link href="/register" className="underline underline-offset-4 hover:text-primary">
						Registrieren
					</Link>
				</p>
			</div>
		</div>
	)
}
