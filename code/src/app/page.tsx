'use client'

import { ActivityFeed } from '@/components/activity-feed'
import { CategoryTabs } from '@/components/category-tabs'
import { SearchFilters } from '@/components/search-filters'
import { ActiveModule } from '@/types/general'
import { useState } from 'react'

export default function Home() {
	const [activeCategory, setActiveCategory] = useState<ActiveModule>({
		id: 'all',
		name: 'All',
	})
	const [searchQuery, setSearchQuery] = useState('')
	const [sortBy, setSortBy] = useState<'recent' | 'comments' | 'popular'>('recent')

	return (
		<div className="px-8 py-6 max-w-[1400px] mx-auto">
			<div className="flex gap-6">
				{/* Left sidebar */}
				<aside className="w-64 shrink-0">
					<div className="sticky top-20">
						<h2 className="text-xl font-semibold mb-4">Categories</h2>
						<CategoryTabs activeModule={activeCategory} setActiveModule={setActiveCategory} />
					</div>
				</aside>

				{/* Main content */}
				<div className="flex-1">
					<SearchFilters
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						sortBy={sortBy}
						setSortBy={setSortBy}
					/>

					<div className="mt-6">
						<ActivityFeed />
					</div>
				</div>
			</div>
		</div>
	)
}
