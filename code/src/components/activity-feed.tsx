'use client'

import { useEffect, useState } from 'react'
import { Module, SimplePost } from '@/types/general'
import { getPosts } from '@/actions/post'
import { Loader2 } from 'lucide-react'
import FeedItem from './feed-item'

export function ActivityFeed({
	activeModule,
	searchQuery = '',
	sortBy = 'recent',
}: {
	activeModule: Module
	searchQuery?: string
	sortBy?: 'recent' | 'popular' | 'comments'
}) {
	const [feedItems, setFeedItems] = useState<SimplePost[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadPosts() {
			setLoading(true)
			setError(null)

			try {
				const response = await getPosts({
					moduleId: activeModule.id,
					searchQuery,
					sortBy,
				})

				if (response.success && response.data) {
					setFeedItems(response.data)
				} else {
					setError(response.error || 'Failed to load posts')
				}
			} catch (err) {
				setError('An error occurred while fetching posts')
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		loadPosts()
	}, [activeModule.id, searchQuery, sortBy])

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
				<Loader2 className="h-8 w-8 animate-spin mb-2" />
				<p>Beiträge werden geladen...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="text-destructive text-center max-w-md">
					<p className="text-lg font-medium mb-2">Fehler beim Laden der Beiträge</p>
					<p className="text-sm text-muted-foreground">{error}</p>
				</div>
			</div>
		)
	}

	if (feedItems.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
				<p className="text-lg font-medium mb-1">Keine Beiträge gefunden</p>
				<p className="text-sm">Sei der Erste, der einen Beitrag erstellt!</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{feedItems.map((item) => (
				<FeedItem key={item.id} itemId={item.id} />
			))}
		</div>
	)
}
