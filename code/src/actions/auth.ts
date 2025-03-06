'use server'

import { z } from 'zod'
import { registerSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function registerUser(userData: z.infer<typeof registerSchema>) {
	try {
		const validatedData = registerSchema.parse(userData)

		const { data, error } = await supabase.auth.signUp({
			email: validatedData.email,
			password: validatedData.password,
			options: {
				data: {
					first_name: validatedData.firstName,
					last_name: validatedData.lastName,
				},
			},
		})

		if (error) {
			return {
				success: false,
				error: error.message,
			}
		}

		if (data.user) {
			const { error: insertError } = await supabase.from('users').insert({
				id: data.user.id,
				firstname: validatedData.firstName,
				lastname: validatedData.lastName,
				email: validatedData.email,
			})

			if (insertError) {
				console.error('Error while inserting user', insertError)
			}
		}

		return {
			success: true,
			user: data.user,
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.errors.map((e) => e.message).join(', '),
			}
		}

		return {
			success: false,
			error: 'Ein unerwarteter Fehler ist aufgetreten',
		}
	}
}

export async function auth() {
	return await getServerSession(authOptions)
}
