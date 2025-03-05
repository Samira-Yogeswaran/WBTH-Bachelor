import { ActivityFeed } from '@/components/activity-feed'
// import { SearchFilters } from '@/components/search-filters'
// import { CategoryTabs } from '@/components/category-tabs'

export default async function Home() {
	return (
		<div className="container mx-auto px-4 py-6 max-w-5xl">
			<div className="flex flex-col md:flex-row gap-6">
				{/* Left sidebar for larger screens */}
				<aside className="hidden md:block w-64 shrink-0">
					<div className="sticky top-20">
						<h2 className="text-xl font-semibold mb-4">Categories</h2>
						{/* <CategoryTabs orientation="vertical" /> */}
					</div>
				</aside>

				{/* Main content */}
				<div className="flex-1">
					{/* Mobile category tabs */}
					<div className="md:hidden mb-6">{/* <CategoryTabs orientation="horizontal" /> */}</div>

					{/* Search and filters */}
					{/* <SearchFilters /> */}

					{/* Activity feed */}
					<div className="mt-6">
						<ActivityFeed />
					</div>
				</div>
			</div>
		</div>
	)
}
