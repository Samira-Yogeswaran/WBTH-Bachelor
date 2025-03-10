'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPost, likePost } from '@/actions/post'
import { useEffect, useState } from 'react'
import { Post } from '@/types/general'
import { CardSkeleton } from './card-skeleton'

export default function FeedItem({ itemId }: { itemId: string }) {
	const [item, setItem] = useState<Post | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadPost() {
			const { data, error } = await getPost(itemId)
			if (error || !data) {
				setError(error)
				return
			}

			setItem(data)
			setLoading(false)
		}

		loadPost()
	}, [itemId])

	const handleLike = async (postId: string) => {
		if (!item) return
		const { success } = await likePost(postId)
		if (success) {
			setItem((prev) => {
				if (!prev) return prev
				return {
					...prev,
					liked: !prev.liked,
					likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
				}
			})
		}
	}

	if (loading) return <CardSkeleton />
	if (error || !item) return <h1>{error}</h1>

	return (
		<Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
			<CardHeader className="p-4 pb-0">
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-3">
						<Avatar>
							<AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium">{item.user.name}</div>
							<div className="text-sm text-muted-foreground">
								@{item.user.username} · {item.timestamp}
							</div>
						</div>
					</div>
					<Badge variant="outline">{item.module}</Badge>
				</div>
			</CardHeader>
			<CardContent className="p-4">
				<Link href={`/posts/${item.id}`} className="block">
					<h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
						{item.title}
					</h3>
				</Link>
			</CardContent>
			<CardFooter className="p-4 pt-0 flex justify-between">
				<div className="flex gap-4">
					<Button
						variant="ghost"
						size="sm"
						className="flex items-center gap-1 text-muted-foreground hover:text-primary"
						onClick={() => handleLike(item.id)}
					>
						<Heart className={cn('h-4 w-4', item.liked ? 'fill-primary text-primary' : '')} />
						<span>{item.likes}</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="flex items-center gap-1 text-muted-foreground hover:text-primary"
						asChild
					>
						<Link href={`/posts/${item.id}#comments`}>
							<MessageCircle className="h-4 w-4" />
							<span>{item.comments}</span>
						</Link>
					</Button>
				</div>
			</CardFooter>
		</Card>
	)
}
