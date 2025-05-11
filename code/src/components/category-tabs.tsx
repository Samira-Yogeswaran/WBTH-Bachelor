'use client'

import { useEffect, useState } from 'react'
import { cn, groupModulesByType } from '@/lib/utils'
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
				const { data } = await supabaseClient.from('modules').select('id, name, etcs_credits, type')
				const allModule = { id: 'all', name: 'Alle', etcs_credits: 0, type: 'Alle' }

				if (data) {
					setModules([allModule, ...data])
				} else {
					setModules([allModule])
				}
			} catch (error) {
				console.error('Error fetching modules:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchModules()
	}, [])

	const groupedModules = groupModulesByType(modules)
	const sortedTypes = Object.keys(groupedModules).sort()

	return (
		<div className="space-y-4">
			{isLoading ? (
				<>
					{Array(8)
						.fill(0)
						.map((_, i) => (
							<Skeleton key={i} className="h-8 w-full rounded-md" />
						))}
				</>
			) : (
				sortedTypes.map((type) => (
					<div key={type}>
						<h3 className="text-sm font-semibold text-gray-700 mb-1">{type}</h3>
						<div className="space-y-1">
							{groupedModules[type].map((module) => (
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
									<span className="ml-auto">
										{module.id !== 'all' && (
											<span className="text-xs text-gray-500">({module.etcs_credits} ECTS)</span>
										)}
									</span>
								</Button>
							))}
						</div>
					</div>
				))
			)}
		</div>
	)
}
