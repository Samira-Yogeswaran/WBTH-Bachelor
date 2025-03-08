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
}

export type SimplePost = {
	id: string
	title: string
	created_at: string
	module_id: string
	user_id: string
}
