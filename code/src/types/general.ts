export type Module = {
	id: string
	name: string
}

export type Post = {
	id: string
	user: {
		id: string
		name: string
		username: string
	}
	module: string
	title: string
	likes: number
	comments: number
	timestamp: string
	liked: boolean
	files: PostFile[]
}

export type SimplePost = {
	id: string
	title: string
	created_at: string
	module_id: string
	user_id: string
	files: PostFile[]
}

export type Comment = {
	id: string
	content: string
	timestamp: string
	user: {
		id: string
		name: string
		username: string
	}
}

export type PostFile = {
	id: string
	file_name: string
	file_url: string
	file_type: string
	file_size: number
	version: number
}

export type UploadResult = {
	success: boolean
	filePath?: string
	publicUrl?: string
	error?: string
}
