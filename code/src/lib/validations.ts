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
