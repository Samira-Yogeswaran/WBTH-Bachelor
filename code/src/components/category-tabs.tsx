'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const categories = [
	{ id: 'all', name: 'Alle' },
	{ id: 'math', name: 'Mathematik' },
	{ id: 'software', name: 'Software' },
	{ id: 'business', name: 'Wirtschaft' },
	{ id: 'science', name: 'Wissenschaft' },
	{ id: 'languages', name: 'Sprachen' },
	{ id: 'arts', name: 'Kunst' },
	{ id: 'engineering', name: 'Ingenieurwesen' },
]

export function CategoryTabs() {
	const [activeCategory, setActiveCategory] = useState('all')

	return (
		<div className="space-y-1">
			{categories.map((category) => (
				<Button
					key={category.id}
					variant={activeCategory === category.id ? 'default' : 'ghost'}
					size="sm"
					onClick={() => setActiveCategory(category.id)}
					className={cn(
						'justify-start w-full hover:cursor-pointer',
						activeCategory === category.id ? '' : 'hover:bg-transparent hover:underline'
					)}
				>
					{category.name}
				</Button>
			))}
		</div>
	)
}
