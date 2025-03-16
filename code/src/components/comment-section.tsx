'use client'

import { Send } from 'lucide-react'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { useEffect, useState } from 'react'
import { createComment, getComments } from '@/actions/post'
import { Comment } from '@/types/general'
import { Skeleton } from './ui/skeleton'
import CommentSkeleton from './comment-skeleton'
import { Alert, AlertDescription } from './ui/alert'
import { AlertCircle } from 'lucide-react'

export default function CommentSection({ postId, username }: { postId: string; username: string }) {
	const [comments, setComments] = useState<Comment[]>([])
	const [newComment, setNewComment] = useState('')
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadComments() {
			try {
				const { data } = await getComments(postId)
				if (data) {
					setComments(data)
				}
			} catch (err) {
				console.error(err)
				setError('Fehler beim Laden der Kommentare.')
			} finally {
				setLoading(false)
			}
		}

		loadComments()
	}, [postId])

	const handleSubmitComment = async () => {
		if (!newComment.trim()) return

		setSubmitting(true)
		setError(null)

		try {
			const { data } = await createComment(postId, newComment)
			if (data) {
				setComments((prev) => [data, ...prev])
				setNewComment('')
			} else {
				setError('Beim Erstellen des Kommentars ist ein Fehler aufgetreten.')
			}
		} catch (err) {
			console.error(err)
			setError('Beim Erstellen des Kommentars ist ein Fehler aufgetreten.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div>
			<div className="flex gap-4">
				<Avatar>
					<AvatarFallback>{username.charAt(0)}</AvatarFallback>
				</Avatar>
				<div className="flex-1 space-y-2">
					<Textarea
						placeholder="Kommentar hinzufügen..."
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						className="min-h-[80px]"
						disabled={submitting}
					/>
					{error && (
						<Alert variant="destructive" className="mt-2">
							<AlertCircle className="h-4 w-4 mr-2" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<div className="flex justify-end">
						<Button onClick={handleSubmitComment} disabled={submitting || !newComment.trim()}>
							{submitting ? (
								<>
									<span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-current"></span>
									Wird gesendet...
								</>
							) : (
								<>
									<Send className="h-4 w-4 mr-2" />
									Kommentieren
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			<div className="space-y-6 mt-6" id="comments">
				<h3 className="font-medium">
					{loading ? (
						<Skeleton className="h-6 w-40 inline-block" />
					) : (
						`Kommentare (${comments.length})`
					)}
				</h3>

				{loading ? (
					<div className="space-y-6">
						<CommentSkeleton />
						<CommentSkeleton />
						<CommentSkeleton />
					</div>
				) : (
					comments.map((comment) => (
						<div key={comment.id} className="space-y-4">
							<div className="flex gap-4">
								<Avatar>
									<AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="bg-muted p-4 rounded-lg">
										<div className="flex justify-between items-start">
											<div>
												<span className="font-medium">{comment.user.name}</span>
												<span className="text-sm text-muted-foreground ml-2">
													@{comment.user.username}
												</span>
											</div>
											<span className="text-xs text-muted-foreground">{comment.timestamp}</span>
										</div>
										<p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
