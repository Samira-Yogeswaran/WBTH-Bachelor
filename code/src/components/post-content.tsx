'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { Heart, MessageCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Post, PostFile } from '@/types/general'
import { likePost } from '@/actions/post'
import { useState } from 'react'

export default function PostContent({ content }: { content: Post }) {
	const [post, setPost] = useState<Post>(content)

	const handleLike = async () => {
		const { success } = await likePost(post.id)
		if (success) {
			setPost((prev) => {
				if (!prev) return prev
				return {
					...prev,
					liked: !prev.liked,
					likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
				}
			})
		}
	}

	const handleDownload = async (file: PostFile) => {
		try {
			const response = await fetch(file.file_url)

			if (!response.ok) {
				throw new Error(`Download fehlgeschlagen: ${response.statusText}`)
			}

			const blob = await response.blob()

			const blobUrl = window.URL.createObjectURL(blob)
			const downloadLink = document.createElement('a')
			downloadLink.href = blobUrl
			downloadLink.download = file.file_name.trim()
			downloadLink.style.display = 'none'
			document.body.appendChild(downloadLink)
			downloadLink.click()

			document.body.removeChild(downloadLink)
			window.URL.revokeObjectURL(blobUrl)
		} catch (error) {
			console.error('Download failed:', error instanceof Error ? error.message : String(error))
		}
	}

	return (
		<Card className="overflow-hidden">
			<CardHeader className="p-6">
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-3">
						<Avatar>
							<AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium">{post.user.name}</div>
							<div className="text-sm text-muted-foreground">
								@{post.user.username} · {post.timestamp}
							</div>
						</div>
					</div>
					<Badge variant="outline">{post.module}</Badge>
				</div>
				<h1 className="text-2xl font-bold mt-4">{post.title}</h1>
			</CardHeader>
			<CardContent className="p-6 pt-0 space-y-6">
				{post.files && post.files.length > 0 && (
					<div className="space-y-2">
						<h3 className="text-sm font-medium mb-2">Angehängte Dateien</h3>
						{post.files.map((file) => (
							<div
								key={file.id}
								className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted transition-colors"
							>
								<a
									href={file.file_url}
									className="flex-1 flex gap-2"
									target="_blank"
									rel="noreferrer"
								>
									<FileText className="h-5 w-5 text-muted-foreground" />
									<span className="font-medium">{file.file_name}</span>
									<div className="ml-auto flex items-center">
										<Badge variant="outline" className="text-[10px] px-2 py-0 h-5">
											v{file.version}
										</Badge>
									</div>
								</a>
								<Button
									size="sm"
									onClick={async (e) => {
										e.preventDefault()
										await handleDownload(file)
									}}
								>
									Herunterladen
								</Button>
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
							<span>{post.comments}</span>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
