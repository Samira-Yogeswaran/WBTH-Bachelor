'use server'

import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { postSchema } from '@/lib/validations'
import { auth } from './auth'
import { Comment, PostFile, Post, SimplePost, UploadResult } from '@/types/general'
import { formatTimestamp } from '@/lib/utils'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export async function getPosts({
	moduleId = 'all',
	searchQuery = '',
	sortBy = 'recent',
}: {
	moduleId?: string
	searchQuery?: string
	sortBy?: 'recent' | 'popular' | 'comments'
}) {
	let query = supabase.rpc('search_posts', {
		search_text: searchQuery.trim() || '', // or else the stored procedure will return all posts
	}) as PostgrestFilterBuilder<any, any, SimplePost[], 'posts', unknown>

	if (moduleId !== 'all') {
		query = query.eq('module_id', moduleId)
	}

	if (sortBy === 'recent') {
		query = query.order('created_at', { ascending: false })
	}

	const { data: posts, error: postsError } = await query

	if (postsError) {
		console.error('Error fetching posts:', postsError)
		return { success: false, error: 'Beim Abrufen der Beiträge ist ein Fehler aufgetreten.' }
	}

	if (!posts || posts.length === 0) {
		return { success: true, data: [] }
	}

	const postsLikes = (await supabase.rpc('count_likes_by_post', {
		post_ids: posts.map((post) => post.id),
	})) as PostgrestSingleResponse<{ post_id: string; count: number }[]>

	if (postsLikes.error) {
		console.error('Error fetching likes:', postsLikes.error)
		return { success: false, error: 'Beim Abrufen der Beiträge ist ein Fehler aufgetreten.' }
	}

	if (sortBy === 'popular') {
		posts.sort((a, b) => {
			const likesA = postsLikes.data.find((item) => item.post_id === a.id)?.count || 0
			const likesB = postsLikes.data.find((item) => item.post_id === b.id)?.count || 0
			return likesB - likesA
		})
	}

	const postsComments = (await supabase.rpc('count_comments_by_post', {
		post_ids: posts.map((post) => post.id),
	})) as PostgrestSingleResponse<{ post_id: string; count: number }[]>

	if (postsComments.error) {
		console.error('Error fetching comments:', postsComments.error)
		return { success: false, error: 'Beim Abrufen der Beiträge ist ein Fehler aufgetreten.' }
	}

	if (sortBy === 'comments') {
		posts.sort((a, b) => {
			const commentsA = postsComments.data.find((item) => item.post_id === a.id)?.count || 0
			const commentsB = postsComments.data.find((item) => item.post_id === b.id)?.count || 0
			return commentsB - commentsA
		})
	}

	return { success: true, data: posts }
}

export async function getPost(postId: string) {
	const { data, error } = await supabase
		.from('posts')
		.select(
			`
		id,
		title,
		created_at,
		user_id,
		module_id
	`
		)
		.eq('id', postId)
		.single()

	if (error) {
		console.error('Error fetching post:', error)
		return { success: false, error: 'Beitrag nicht gefunden' }
	}

	if (!data) {
		return { success: false, error: 'Beitrag nicht gefunden' }
	}

	const postLikes = await supabase.rpc('count_likes_by_post', {
		post_ids: [postId],
	})

	const postComments = await supabase.rpc('count_comments_by_post', {
		post_ids: [postId],
	})

	const user = await supabase
		.from('users')
		.select('id, firstname, lastname, email')
		.eq('id', data.user_id)
		.single()

	const _module = await supabase
		.from('modules')
		.select('id, name')
		.eq('id', data.module_id)
		.single()

	if (!user.data || !_module.data) {
		return { success: false, error: 'Beitrag nicht gefunden' }
	}

	const loggedUser = await auth()
	const isLiked = await supabase
		.from('likes')
		.select('id')
		.eq('post_id', postId)
		.eq('user_id', loggedUser?.user.id)
		.single()

	const postFiles: PostgrestSingleResponse<PostFile[]> = await supabase
		.from('files')
		.select('id, file_name, file_url, file_type, file_size, version')
		.eq('post_id', postId)

	if (postFiles.error) {
		console.error('Error fetching files:', postFiles.error)
		return { success: false, error: 'Beim Abrufen der Dateien ist ein Fehler aufgetreten.' }
	}

	return {
		success: true,
		data: {
			id: data.id,
			title: data.title,
			user: {
				id: user.data.id,
				name: `${user.data.firstname} ${user.data.lastname}`,
				username: user.data.email.split('@')[0],
			},
			module: _module.data.name,
			likes: postLikes.data[0]?.count || 0,
			comments: postComments.data[0]?.count || 0,
			timestamp: formatTimestamp(data.created_at),
			liked: !!isLiked.data,
			files: postFiles.data,
		} as Post,
	}
}

export async function createPost(values: z.infer<typeof postSchema>) {
	try {
		const validatedData = postSchema.parse(values)
		const session = await auth()
		const userId = session?.user.id

		if (!userId) {
			console.error('User not found')
			return { success: false, error: 'Benutzer nicht gefunden' }
		}

		const uploadedFiles = await Promise.all(
			validatedData.files.map(async (file) => {
				const { publicUrl } = await uploadFile(file.file, userId, 'posts')

				return {
					file_name: file.file.name,
					file_url: publicUrl,
					file_type: file.file.type,
					file_size: file.file.size,
					version: 1, // starts at version 1
				}
			})
		)

		const { data: postData, error: postError } = await supabase
			.from('posts')
			.insert({
				title: validatedData.title,
				module_id: validatedData.module,
				user_id: userId,
			})
			.select()

		if (postError) {
			console.error('Error creating post:', postError)
			return { success: false, error: 'Beim Erstellen des Beitrags ist ein Fehler aufgetreten.' }
		}

		const { error: filesError } = await supabase.from('files').insert(
			uploadedFiles.map((file) => ({
				post_id: postData[0].id,
				...file,
			}))
		)

		if (filesError) {
			console.error('Error creating files:', filesError)
			return { success: false, error: 'Beim Erstellen der Dateien ist ein Fehler aufgetreten.' }
		}

		return { success: true, data: postData[0] as SimplePost }
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

export async function updatePost(postId: string, values: z.infer<typeof postSchema>) {
	try {
		const validatedData = postSchema.parse(values)
		const session = await auth()
		const userId = session?.user.id

		if (!userId) {
			console.error('User not found')
			return { success: false, error: 'Benutzer nicht gefunden' }
		}

		// Check if the post belongs to the user
		const { data: post, error: postError } = await supabase
			.from('posts')
			.select('id, user_id')
			.eq('id', postId)
			.single()

		if (postError || !post) {
			console.error('Error fetching post:', postError)
			return { success: false, error: 'Beitrag nicht gefunden' }
		}

		if (post.user_id !== userId) {
			return { success: false, error: 'Sie sind nicht berechtigt, diesen Beitrag zu bearbeiten' }
		}

		// Get existing files
		const { data: existingFiles, error: filesError } = await supabase
			.from('files')
			.select('id, file_name, file_url')
			.eq('post_id', postId)

		if (filesError) {
			console.error('Error fetching files:', filesError)
			return { success: false, error: 'Beim Abrufen der Dateien ist ein Fehler aufgetreten.' }
		}

		// Find files to delete (files that exist in DB but not in the form submission)
		const filesToDelete =
			existingFiles?.filter(
				(existingFile) => !validatedData.files.some((newFile) => newFile.id === existingFile.id)
			) || []

		// Delete removed files from storage and database
		for (const file of filesToDelete) {
			const fileUrl = new URL(file.file_url)
			const pathMatch = fileUrl.pathname.match(/\/storage\/v1\/object\/public\/studygram\/(.+)/)

			if (pathMatch) {
				const filePath = pathMatch[1]
				await supabase.storage.from('studygram').remove([filePath])
			}

			await supabase.from('files').delete().eq('id', file.id)
		}

		// Find new files to upload (files that have a temporary ID starting with 'file-')
		const newFiles = validatedData.files.filter((file) => file.id.startsWith('file-'))

		// Upload only new files
		const uploadedFiles = await Promise.all(
			newFiles.map(async (file) => {
				const { publicUrl } = await uploadFile(file.file, userId, 'posts')

				return {
					file_name: file.file.name,
					file_url: publicUrl,
					file_type: file.file.type,
					file_size: file.file.size,
					version: 1,
					post_id: postId,
				}
			})
		)

		// Insert only new files
		if (uploadedFiles.length > 0) {
			const { error: insertError } = await supabase.from('files').insert(uploadedFiles)

			if (insertError) {
				console.error('Error inserting files:', insertError)
				return { success: false, error: 'Beim Hochladen der Dateien ist ein Fehler aufgetreten.' }
			}
		}

		// Update post
		const { error: updateError } = await supabase
			.from('posts')
			.update({
				title: validatedData.title,
				module_id: validatedData.module,
			})
			.eq('id', postId)

		if (updateError) {
			console.error('Error updating post:', updateError)
			return {
				success: false,
				error: 'Beim Aktualisieren des Beitrags ist ein Fehler aufgetreten.',
			}
		}

		return { success: true, data: { id: postId } }
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

export async function uploadFile(
	file: File,
	userId: string,
	folder: string
): Promise<UploadResult> {
	try {
		if (!file) {
			return { success: false, error: 'No file provided' }
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
			error: error instanceof Error ? error.message : 'An unknown error occurred',
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
			error: error instanceof Error ? error.message : 'An unknown error occurred',
		}
	}
}

export async function likePost(postId: string) {
	const session = await auth()
	const userId = session?.user.id

	const isLiked = await supabase
		.from('likes')
		.select('id')
		.eq('post_id', postId)
		.eq('user_id', userId)
		.single()

	if (isLiked.data) {
		const { error } = await supabase.from('likes').delete().eq('id', isLiked.data.id)

		if (error) {
			console.error('Error deleting like:', error)
			return { success: false, error: 'Beim Entfernen des Likes ist ein Fehler aufgetreten.' }
		}

		return { success: true }
	}

	const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId })

	if (error) {
		console.error('Error inserting like:', error)
		return { success: false, error: 'Beim Hinzufügen des Likes ist ein Fehler aufgetreten.' }
	}

	return { success: true }
}

export async function getComments(postId: string) {
	const { data: comments, error } = await supabase
		.from('comments')
		.select(`id, content, created_at, user_id`)
		.eq('post_id', postId)
		.order('created_at', { ascending: false })

	if (error) {
		console.error('Error fetching comments:', error)
		return { success: false, error: 'Beim Abrufen der Kommentare ist ein Fehler aufgetreten.' }
	}

	if (!comments || comments.length === 0) {
		return { success: true, data: [] }
	}

	const commentsWithUser = await Promise.all(
		comments.map(async (comment) => {
			const user = await supabase
				.from('users')
				.select('id, firstname, lastname, email')
				.eq('id', comment.user_id)
				.single()

			if (!user.data) {
				return null
			}

			return {
				id: comment.id,
				content: comment.content,
				timestamp: formatTimestamp(comment.created_at),
				user: {
					name: `${user.data.firstname} ${user.data.lastname}`,
					username: user.data.email.split('@')[0],
				},
			}
		})
	)

	return { success: true, data: commentsWithUser as unknown as Comment[] }
}

export async function createComment(postId: string, content: string) {
	const session = await auth()
	const userId = session?.user.id

	const { data, error } = await supabase
		.from('comments')
		.insert({
			post_id: postId,
			user_id: userId,
			content,
		})
		.select()

	if (error) {
		console.error('Error creating comment:', error)
		return { success: false, error: 'Beim Erstellen des Kommentars ist ein Fehler aufgetreten.' }
	}

	const user = await supabase
		.from('users')
		.select('id, firstname, lastname, email')
		.eq('id', userId)
		.single()

	if (!user.data) {
		return { success: false, error: 'Beim Erstellen des Kommentars ist ein Fehler aufgetreten.' }
	}

	console.log(data)

	const commentWithUser = {
		id: data[0].id,
		content: data[0].content,
		timestamp: 'Gerade eben',
		user: {
			name: `${user.data.firstname} ${user.data.lastname}`,
			username: user.data.email.split('@')[0],
		},
	}

	return { success: true, data: commentWithUser as unknown as Comment }
}

export async function getPostsByUser() {
	const session = await auth()
	const userId = session?.user.id

	const { data: posts, error } = await supabase
		.from('posts')
		.select('id, created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })

	if (error) {
		console.error('Error fetching posts:', error)
		return { success: false, error: 'Beim Abrufen der Beiträge ist ein Fehler aufgetreten.' }
	}

	if (!posts || posts.length === 0) {
		return { success: true, data: [] }
	}

	return { success: true, data: posts } as {
		success: true
		data: {
			id: string
			created_at: string
		}[]
	}
}

export async function deletePost(postId: string) {
	try {
		const session = await auth()
		const userId = session?.user.id

		if (!userId) {
			return { success: false, error: 'Nicht authentifiziert' }
		}

		// Check if the post belongs to the user
		const { data: post, error: postError } = await supabase
			.from('posts')
			.select('id, user_id')
			.eq('id', postId)
			.single()

		if (postError || !post) {
			console.error('Error fetching post:', postError)
			return { success: false, error: 'Beitrag nicht gefunden' }
		}

		if (post.user_id !== userId) {
			return { success: false, error: 'Sie sind nicht berechtigt, diesen Beitrag zu löschen' }
		}

		// Get files associated with the post to delete from storage later
		const { data: files, error: filesError } = await supabase
			.from('files')
			.select('file_url')
			.eq('post_id', postId)

		if (filesError) {
			console.error('Error fetching files:', filesError)
			// Continue with post deletion even if file fetching fails
		}

		// Delete the post (this will cascade delete likes, comments, and file records)
		const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId)

		if (deleteError) {
			console.error('Error deleting post:', deleteError)
			return { success: false, error: 'Beim Löschen des Beitrags ist ein Fehler aufgetreten' }
		}

		// Delete files from storage if any
		if (files && files.length > 0) {
			// Extract file paths from URLs
			const filePaths = files
				.map((file) => {
					const url = new URL(file.file_url)
					const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/studygram\/(.+)/)
					return pathMatch ? pathMatch[1] : null
				})
				.filter(Boolean) as string[]

			if (filePaths.length > 0) {
				const { error: storageError } = await supabase.storage.from('studygram').remove(filePaths)

				if (storageError) {
					console.error('Error deleting files from storage:', storageError)
					// Post is already deleted, so return success anyway
				}
			}
		}

		return { success: true }
	} catch (error) {
		console.error('Delete post error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten',
		}
	}
}
