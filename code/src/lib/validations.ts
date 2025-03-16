import { z } from 'zod'

export const registerSchema = z
	.object({
		firstName: z.string().min(2, { message: 'Vorname muss mindestens 2 Zeichen lang sein' }),
		lastName: z.string().min(2, { message: 'Nachname muss mindestens 2 Zeichen lang sein' }),
		email: z.string().email({ message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' }),
		password: z.string().min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwörter stimmen nicht überein',
		path: ['confirmPassword'],
	})

export const loginSchema = z.object({
	email: z.string().email({ message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' }),
	password: z.string().min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' }),
})

export const postSchema = z.object({
	title: z.string().min(5, { message: 'Titel muss mindestens 5 Zeichen lang sein' }),
	module: z.string().nonempty({ message: 'Bitte wählen Sie ein Modul aus' }),
	files: z
		.array(
			z.object({
				id: z.string(),
				file: z.instanceof(File, { message: 'Muss eine gültige Datei sein' }),
			})
		)
		.default([]),
})
