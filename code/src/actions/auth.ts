'use server'

import { z } from 'zod'
import { profileFormSchema, registerSchema } from '@/lib/validations'
import { supabaseAuth } from '@/lib/supabase/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/utils'
import { User } from '@/types/general'
import { createAuthClient } from '@/lib/supabase/server'

export default async function registerUser(userData: z.infer<typeof registerSchema>) {
	try {
		const validatedData = registerSchema.parse(userData)

		const { data, error } = await supabaseAuth.auth.signUp({
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

export async function editProfile(
	values: z.infer<typeof profileFormSchema>
): Promise<{ success: boolean; user?: User; error?: string }> {
	const supabaseServerClient = await createAuthClient()
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return {
				success: false,
				error: 'Not authenticated',
			}
		}

		const validatedData = profileFormSchema.parse(values)
		const { data, error } = await supabaseServerClient.auth.admin.updateUserById(session.user.id, {
			user_metadata: {
				first_name: validatedData.firstName,
				last_name: validatedData.lastName,
			},
		})

		if (error) {
			return {
				success: false,
				error: error.message,
			}
		}

		return {
			success: true,
			user: {
				id: data.user.id,
				firstname: data.user.user_metadata.first_name,
				lastname: data.user.user_metadata.last_name,
				email: data.user.email || '',
				createdAt: data.user.created_at,
			},
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

export async function getUser(): Promise<User | null> {
	const session = await auth()
	if (!session?.user?.id) {
		return null
	}

	const { data, error } = await supabaseAuth
		.from('users')
		.select('*')
		.eq('id', session.user.id)
		.single()

	if (error) {
		console.error('Error fetching user:', error)
		return null
	}

	return data
}
