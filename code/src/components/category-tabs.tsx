'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { ActiveModule } from '@/types/general'

export function CategoryTabs({
	activeModule,
	setActiveModule,
}: {
	activeModule: ActiveModule
	setActiveModule: (module: ActiveModule) => void
}) {
	const [modules, setModules] = useState<
		{
			id: string
			name: string
		}[]
	>([
		{
			id: 'all',
			name: 'All',
		},
	])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchModules = async () => {
			setIsLoading(true)
			try {
				const { data } = await supabase.from('modules').select('name')
				if (data) {
					setModules((prev) => [
						...prev,
						...data.map((module) => ({
							id: module.name,
							name: module.name,
						})),
					])
				}
			} catch (error) {
				console.error('Error fetching modules:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchModules()

		return () => {
			setModules([
				{
					id: 'all',
					name: 'All',
				},
			])
		}
	}, [])

	return (
		<div className="space-y-1">
			{isLoading ? (
				<>
					{Array(8)
						.fill(0)
						.map((_, i) => (
							<Skeleton key={i} className="h-8 w-full rounded-md" />
						))}
				</>
			) : (
				modules.map((module) => (
					<Button
						key={module.id}
						variant={activeModule.id === module.id ? 'default' : 'ghost'}
						size="sm"
						onClick={() => setActiveModule(module)}
						className={cn(
							'justify-start w-full hover:cursor-pointer',
							activeModule.id === module.id ? '' : 'hover:bg-transparent hover:underline'
						)}
					>
						{module.name}
					</Button>
				))
			)}
		</div>
	)
}
