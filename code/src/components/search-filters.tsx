'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

export function SearchFilters() {
	const [searchQuery, setSearchQuery] = useState('')

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Diskussionen und Dateien durchsuchen..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex gap-2">
					<Select defaultValue="recent">
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="recent">Neueste</SelectItem>
							<SelectItem value="popular">Beliebteste</SelectItem>
							<SelectItem value="comments">Meiste Kommentare</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	)
}
