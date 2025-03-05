import { ActivityFeed } from '@/components/activity-feed'
import { CategoryTabs } from '@/components/category-tabs'
import { SearchFilters } from '@/components/search-filters'

export default function Home() {
	return (
		<div className="px-8 py-6 max-w-[1400px] mx-auto">
			<div className="flex gap-6">
				{/* Left sidebar */}
				<aside className="w-64 shrink-0">
					<div className="sticky top-20">
						<h2 className="text-xl font-semibold mb-4">Categories</h2>
						<CategoryTabs />
					</div>
				</aside>

				{/* Main content */}
				<div className="flex-1">
					{/* Search and filters */}
					<SearchFilters />

					{/* Activity feed */}
					<div className="mt-6">
						<ActivityFeed />
					</div>
				</div>
			</div>
		</div>
	)
}
