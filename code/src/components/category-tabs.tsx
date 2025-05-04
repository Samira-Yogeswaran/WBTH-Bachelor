'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabaseWithAuth } from '@/lib/supabase/client'
import { Module } from '@/types/general'

export function ModuleTabs({
	activeModule,
	setActiveModule,
}: {
	activeModule: Module
	setActiveModule: (module: Module) => void
}) {
	const [modules, setModules] = useState<Module[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchModules = async () => {
			setIsLoading(true)

			try {
				const supabaseClient = await supabaseWithAuth()
				const { data } = await supabaseClient.from('modules').select('id, name')

				if (data) {
					setModules([{ id: 'all', name: 'Alle' }, ...data])
				} else {
					setModules([{ id: 'all', name: 'Alle' }])
				}
			} catch (error) {
				console.error('Error fetching modules:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchModules()
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
