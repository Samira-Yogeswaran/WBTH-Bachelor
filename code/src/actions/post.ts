'use server'

import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { postSchema } from '@/lib/validations'
import { auth } from './auth'

type UploadResult = {
	success: boolean
	filePath?: string
	publicUrl?: string
	error?: string
}

export async function uploadFile(
	file: File,
	userId: string,
	folder = 'uploads'
): Promise<UploadResult> {
	try {
		if (!file) {
			return { success: false, error: 'Keine Datei bereitgestellt' }
		}

		// Create a unique file path
		const timestamp = Date.now()
		const fileName = file.name
		const filePath = `${folder}/${userId}/${timestamp}_${fileName}`

		// Convert File to ArrayBuffer
		const arrayBuffer = await file.arrayBuffer()
		const fileBuffer = new Uint8Array(arrayBuffer)

		// Upload file to Supabase Storage
		const { error } = await supabase.storage.from('studygram').upload(filePath, fileBuffer, {
			cacheControl: '3600',
			upsert: false,
			contentType: file.type,
		})

		if (error) {
			console.error('Supabase storage error:', error)
			return { success: false, error: error.message }
		}

		// Get public URL for the uploaded file
		const {
			data: { publicUrl },
		} = supabase.storage.from('studygram').getPublicUrl(filePath)

		return {
			success: true,
			filePath,
			publicUrl,
		}
	} catch (error) {
		console.error('Upload error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
		}
	}
}

export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
	try {
		const { error } = await supabase.storage.from('studygram').remove([filePath])

		if (error) {
			return { success: false, error: error.message }
		}

		return { success: true }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
		}
	}
}

export async function createPost(postData: z.infer<typeof postSchema>) {
	try {
		const validatedData = postSchema.parse(postData)
		const session = await auth()
		const userId = session?.user.id

		const { data, error } = await supabase
			.from('posts')
			.insert({
				title: validatedData.title,
				module_id: validatedData.module,
				user_id: userId,
			})
			.select()

		if (error) {
			return {
				success: false,
				error: error.message,
			}
		}

		return {
			success: true,
			data,
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
