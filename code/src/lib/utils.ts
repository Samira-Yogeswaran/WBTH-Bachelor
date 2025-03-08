import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// Helper function to format timestamps
export function formatTimestamp(timestamp: string): string {
	const date = new Date(timestamp)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffHours < 1) return 'Gerade eben'
	if (diffHours < 24) return `${diffHours} Stunden zuvor`
	if (diffDays === 1) return '1 Tag zuvor'
	return `${diffDays} Tage zuvor`
}
