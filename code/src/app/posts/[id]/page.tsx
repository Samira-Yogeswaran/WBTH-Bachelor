'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Heart, MessageCircle, Share2, Bookmark, FileText, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

// Mock data for the discussion
const mockDiscussion = {
	id: 'post2',
	user: {
		name: 'Alex Chen',
		username: 'alexc',
		avatar: '/placeholder.svg?height=40&width=40',
	},
	category: 'Software',
	title: 'React Hooks Cheatsheet',
	content:
		"Here's a cheatsheet I created for React Hooks with examples and best practices. Hope it helps with your projects!",
	files: [
		{ id: 'file2', name: 'React_Hooks_Cheatsheet.pdf', type: 'pdf', size: '1.8 MB' },
		{ id: 'file3', name: 'hooks_examples.js', type: 'js', size: '4.2 KB' },
	],
	images: ['/placeholder.svg?height=300&width=600'],
	likes: 56,
	comments: [
		{
			id: 'comment1',
			user: {
				name: 'Sarah Johnson',
				username: 'sarahj',
				avatar: '/placeholder.svg?height=32&width=32',
			},
			content:
				"This is incredibly helpful! I've been struggling with useEffect dependencies. Thanks for sharing!",
			timestamp: '2 hours ago',
			likes: 8,
			liked: false,
		},
		{
			id: 'comment2',
			user: {
				name: 'Michael Wong',
				username: 'michaelw',
				avatar: '/placeholder.svg?height=32&width=32',
			},
			content: 'Great resource! Could you add some examples of custom hooks as well?',
			timestamp: '5 hours ago',
			likes: 3,
			liked: true,
			replies: [
				{
					id: 'reply1',
					user: {
						name: 'Alex Chen',
						username: 'alexc',
						avatar: '/placeholder.svg?height=32&width=32',
					},
					content: "I'll update the cheatsheet with custom hooks examples soon.",
					timestamp: '4 hours ago',
					likes: 2,
					liked: false,
				},
			],
		},
	],
	timestamp: '1 day ago',
	liked: true,
	bookmarked: true,
}

export default function PostPage({}: { params: { id: string } }) {
	const [post, setPost] = useState(mockDiscussion)
	const [newComment, setNewComment] = useState('')

	const handleLike = () => {
		setPost((prev) => ({
			...prev,
			liked: !prev.liked,
			likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
		}))
	}

	const handleBookmark = () => {
		setPost((prev) => ({
			...prev,
			bookmarked: !prev.bookmarked,
		}))
	}

	const handleCommentLike = (commentId: string) => {
		setPost((prev) => ({
			...prev,
			comments: prev.comments.map((comment) =>
				comment.id === commentId
					? {
							...comment,
							liked: !comment.liked,
							likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
					  }
					: comment
			),
		}))
	}

	const handleSubmitComment = () => {
		if (!newComment.trim()) return

		const newCommentObj = {
			id: `comment${Date.now()}`,
			user: {
				name: 'Current User',
				username: 'currentuser',
				avatar: '/placeholder.svg?height=32&width=32',
			},
			content: newComment,
			timestamp: 'Just now',
			likes: 0,
			liked: false,
		}

		setPost((prev) => ({
			...prev,
			comments: [newCommentObj, ...prev.comments],
		}))

		setNewComment('')
	}

	return (
		<div className="px-8 py-6 max-w-[1000px] mx-auto">
			<Card className="overflow-hidden">
				<CardHeader className="p-6">
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-3">
							<Avatar>
								<AvatarImage src={post.user.avatar} alt={post.user.name} />
								<AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
								<div className="font-medium">{post.user.name}</div>
								<div className="text-sm text-muted-foreground">
									@{post.user.username} · {post.timestamp}
								</div>
							</div>
						</div>
						<Badge variant="outline">{post.category}</Badge>
					</div>
					<h1 className="text-2xl font-bold mt-4">{post.title}</h1>
					<p className="text-muted-foreground mt-2">{post.content}</p>
				</CardHeader>
				<CardContent className="p-6 pt-0 space-y-6">
					{/* Images */}
					{post.images && post.images.length > 0 && (
						<div className="rounded-md overflow-hidden">
							<Image
								src={post.images[0] || '/placeholder.svg'}
								alt="Post attachment"
								width={1000}
								height={500}
								className="w-full h-auto object-cover"
							/>
						</div>
					)}

					{/* Files */}
					{post.files && post.files.length > 0 && (
						<div className="space-y-2">
							<h3 className="text-sm font-medium mb-2">Attached Files</h3>
							{post.files.map((file) => (
								<div
									key={file.id}
									className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted transition-colors"
								>
									<FileText className="h-5 w-5 text-muted-foreground" />
									<div className="flex-1">
										<div className="font-medium">{file.name}</div>
										<div className="text-xs text-muted-foreground">{file.size}</div>
									</div>
									<Button size="sm">Download</Button>
								</div>
							))}
						</div>
					)}

					<div className="flex justify-between items-center pt-4">
						<div className="flex gap-4">
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-1 text-muted-foreground hover:text-primary"
								onClick={handleLike}
							>
								<Heart className={cn('h-4 w-4', post.liked ? 'fill-primary text-primary' : '')} />
								<span>{post.likes}</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-1 text-muted-foreground hover:text-primary"
							>
								<MessageCircle className="h-4 w-4" />
								<span>{post.comments.length}</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-1 text-muted-foreground hover:text-primary"
							>
								<Share2 className="h-4 w-4" />
								<span>Share</span>
							</Button>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								'text-muted-foreground hover:text-primary',
								post.bookmarked ? 'text-primary' : ''
							)}
							onClick={handleBookmark}
						>
							<Bookmark className={cn('h-4 w-4 mr-1', post.bookmarked ? 'fill-primary' : '')} />
							<span>Save</span>
						</Button>
					</div>

					<Separator className="my-6" />

					{/* Add comment */}
					<div className="flex gap-4">
						<Avatar>
							<AvatarImage src="/placeholder.svg?height=32&width=32" alt="Current user" />
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
						<div className="flex-1 space-y-2">
							<Textarea
								placeholder="Add a comment..."
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								className="min-h-[80px]"
							/>
							<div className="flex justify-end">
								<Button onClick={handleSubmitComment}>
									<Send className="h-4 w-4 mr-2" />
									Comment
								</Button>
							</div>
						</div>
					</div>

					{/* Comments */}
					<div className="space-y-6 mt-6">
						<h3 className="font-medium">Comments ({post.comments.length})</h3>

						{post.comments.map((comment) => (
							<div key={comment.id} className="space-y-4">
								<div className="flex gap-4">
									<Avatar>
										<AvatarImage src={comment.user.avatar} alt={comment.user.name} />
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
											<p className="mt-2">{comment.content}</p>
										</div>
										<div className="flex items-center gap-4 mt-1 ml-2">
											<Button
												variant="ghost"
												size="sm"
												className="h-8 px-2 text-muted-foreground hover:text-primary"
												onClick={() => handleCommentLike(comment.id)}
											>
												<Heart
													className={cn(
														'h-4 w-4 mr-1',
														comment.liked ? 'fill-primary text-primary' : ''
													)}
												/>
												<span>{comment.likes}</span>
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 px-2 text-muted-foreground hover:text-primary"
											>
												Reply
											</Button>
										</div>

										{/* Replies */}
										{comment.replies && comment.replies.length > 0 && (
											<div className="ml-6 mt-4 space-y-4">
												{comment.replies.map((reply) => (
													<div key={reply.id} className="flex gap-4">
														<Avatar className="h-8 w-8">
															<AvatarImage src={reply.user.avatar} alt={reply.user.name} />
															<AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<div className="bg-muted p-3 rounded-lg">
																<div className="flex justify-between items-start">
																	<div>
																		<span className="font-medium">{reply.user.name}</span>
																		<span className="text-sm text-muted-foreground ml-2">
																			@{reply.user.username}
																		</span>
																	</div>
																	<span className="text-xs text-muted-foreground">
																		{reply.timestamp}
																	</span>
																</div>
																<p className="mt-1 text-sm">{reply.content}</p>
															</div>
															<div className="flex items-center gap-4 mt-1 ml-2">
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
																>
																	<Heart
																		className={cn(
																			'h-3 w-3 mr-1',
																			reply.liked ? 'fill-primary text-primary' : ''
																		)}
																	/>
																	<span>{reply.likes}</span>
																</Button>
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
