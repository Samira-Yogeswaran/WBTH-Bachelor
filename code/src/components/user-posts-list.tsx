'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Pencil, Trash, Loader2 } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { getPostsByUser, getPost, deletePost } from '@/actions/post'

type PostWithDetails = {
	id: string
	title: string
	module: string
	files: Array<{
		id: string
		file_name: string
		file_url: string
		version: number
	}>
	createdAt: string
}

type UserPostsListProps = {
	userId: string
}

export function UserPostsList({ userId }: UserPostsListProps) {
	const [posts, setPosts] = useState<PostWithDetails[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

	useEffect(() => {
		async function fetchUserPosts() {
			try {
				setLoading(true)
				// First fetch post IDs
				const { data } = await getPostsByUser()

				if (!data) {
					setError('Ein Fehler ist beim Abrufen der Beiträge aufgetreten.')
					return
				}

				// For each post ID, fetch detailed information
				const postsWithDetails = await Promise.all(
					data.map(async (post) => {
						const postDetails = await getPost(post.id)

						if (!postDetails.data) {
							setError('Ein Fehler ist beim Abrufen der Beiträge aufgetreten.')
							return null
						}

						return {
							id: postDetails.data.id,
							title: postDetails.data.title,
							module: postDetails.data.module,
							files: postDetails.data.files,
							createdAt: post.created_at,
						}
					})
				)

				// Filter out any null values from failed requests
				setPosts(postsWithDetails.filter(Boolean) as PostWithDetails[])
			} catch (err) {
				setError('Ein Fehler ist beim Abrufen der Beiträge aufgetreten.')
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		fetchUserPosts()
	}, [userId])

	const handleDeletePost = async (postId: string) => {
		try {
			setDeletingPostId(postId)
			const result = await deletePost(postId)

			if (!result.success) {
				setError(result.error || 'Beim Löschen des Beitrags ist ein Fehler aufgetreten')
				return
			}

			setPosts(posts.filter((post) => post.id !== postId))
		} catch (err) {
			setError('Ein Fehler ist beim Löschen des Beitrags aufgetreten.')
			console.error(err)
		} finally {
			setDeletingPostId(null)
		}
	}

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10">
				<Loader2 className="h-6 w-6 mr-2 animate-spin" />
				<span>Beiträge werden geladen...</span>
			</div>
		)
	}

	if (error) {
		return <div className="text-center text-red-500 py-4">{error}</div>
	}

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<Card key={post.id}>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>{post.title}</span>
							<Badge>{post.module}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-2">
							{post.files && post.files.length > 0 && (
								<div className="mt-2">
									<p className="text-sm font-medium mb-1">Dateien:</p>
									<div className="flex flex-wrap gap-2">
										{post.files.map((file) => (
											<Badge key={file.id} variant="outline" className="flex items-center">
												<FileText className="h-3 w-3 mr-1" />
												{file.file_name}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" asChild>
							<Link href={`/posts/edit/${post.id}`}>
								<Pencil className="mr-2 h-4 w-4" />
								Bearbeiten
							</Link>
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									<Trash className="mr-2 h-4 w-4" />
									Löschen
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
									<AlertDialogDescription>
										Diese Aktion kann nicht rückgängig gemacht werden. Ihr Beitrag wird dauerhaft
										gelöscht und von unseren Servern entfernt.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Abbrechen</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => handleDeletePost(post.id)}
										disabled={deletingPostId === post.id}
									>
										{deletingPostId === post.id ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Wird gelöscht...
											</>
										) : (
											'Löschen'
										)}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</CardFooter>
				</Card>
			))}
			{posts.length === 0 && !loading && (
				<div className="text-center text-muted-foreground">
					Sie haben noch keine Beiträge erstellt.
				</div>
			)}
		</div>
	)
}
