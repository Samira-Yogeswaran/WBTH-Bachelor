'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, Bookmark, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

// Mock data for the feed
const mockFeedItems = [
	{
		id: 'post1',
		user: {
			name: 'Sarah Johnson',
			username: 'sarahj',
			avatar: '/placeholder.svg?height=40&width=40',
		},
		category: 'Math',
		title: 'Calculus Study Guide for Midterms',
		content:
			"I've compiled a comprehensive study guide for calculus midterms covering limits, derivatives, and integrals with practice problems.",
		files: [{ id: 'file1', name: 'Calculus_Study_Guide.pdf', type: 'pdf', size: '2.4 MB' }],
		likes: 24,
		comments: 8,
		timestamp: '2 hours ago',
		liked: false,
		bookmarked: false,
	},
	{
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
		comments: 12,
		timestamp: '5 hours ago',
		liked: true,
		bookmarked: true,
	},
	{
		id: 'post3',
		user: {
			name: 'Maya Patel',
			username: 'mayap',
			avatar: '/placeholder.svg?height=40&width=40',
		},
		category: 'Business',
		title: 'Marketing Strategy Framework',
		content:
			"I'm sharing my marketing strategy framework that helped me ace my business class project. Includes SWOT analysis templates and case studies.",
		files: [
			{ id: 'file4', name: 'Marketing_Framework.pptx', type: 'pptx', size: '5.7 MB' },
			{ id: 'file5', name: 'SWOT_Template.xlsx', type: 'xlsx', size: '1.2 MB' },
		],
		likes: 32,
		comments: 7,
		timestamp: '1 day ago',
		liked: false,
		bookmarked: false,
	},
]

export function ActivityFeed() {
	const [feedItems, setFeedItems] = useState(mockFeedItems)

	const handleLike = (postId: string) => {
		setFeedItems((items) =>
			items.map((item) =>
				item.id === postId
					? {
							...item,
							liked: !item.liked,
							likes: item.liked ? item.likes - 1 : item.likes + 1,
					  }
					: item
			)
		)
	}

	const handleBookmark = (postId: string) => {
		setFeedItems((items) =>
			items.map((item) => (item.id === postId ? { ...item, bookmarked: !item.bookmarked } : item))
		)
	}

	return (
		<div className="space-y-6">
			{feedItems.map((item) => (
				<Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
					<CardHeader className="p-4 pb-0">
						<div className="flex justify-between items-start">
							<div className="flex items-center gap-3">
								<Avatar>
									<AvatarImage src={item.user.avatar} alt={item.user.name} />
									<AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<div>
									<div className="font-medium">{item.user.name}</div>
									<div className="text-sm text-muted-foreground">
										@{item.user.username} ·{' '}
										{item.timestamp === '2 hours ago'
											? '2 Stunden zuvor'
											: item.timestamp === '5 hours ago'
											? '5 Stunden zuvor'
											: item.timestamp === '1 day ago'
											? '1 Tag zuvor'
											: item.timestamp}
									</div>
								</div>
							</div>
							<Badge variant="outline">{item.category}</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-4">
						<Link href={`/posts/${item.id}`} className="block">
							<h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
								{item.title}
							</h3>
							<p className="text-muted-foreground mb-4">{item.content}</p>

							{/* Files */}
							{item.files && item.files.length > 0 && (
								<div className="space-y-2 mb-4">
									{item.files.map((file) => (
										<div
											key={file.id}
											className="flex items-center gap-2 p-2 rounded-md border bg-muted/50 hover:bg-muted transition-colors"
										>
											<FileText className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm font-medium flex-1 truncate">{file.name}</span>
											<span className="text-xs text-muted-foreground">{file.size}</span>
										</div>
									))}
								</div>
							)}

							{/* Images */}
							{item.images && item.images.length > 0 && (
								<div className="rounded-md overflow-hidden mb-4">
									<Image
										src={item.images[0] || '/placeholder.svg'}
										alt="Post attachment"
										width={600}
										height={300}
										className="w-full h-auto object-cover"
									/>
								</div>
							)}
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
								<Link href={`/discussion/${item.id}`}>
									<MessageCircle className="h-4 w-4" />
									<span>{item.comments}</span>
								</Link>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-1 text-muted-foreground hover:text-primary"
							>
								<Share2 className="h-4 w-4" />
							</Button>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								'text-muted-foreground hover:text-primary',
								item.bookmarked ? 'text-primary' : ''
							)}
							onClick={() => handleBookmark(item.id)}
						>
							<Bookmark className={cn('h-4 w-4', item.bookmarked ? 'fill-primary' : '')} />
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	)
}
