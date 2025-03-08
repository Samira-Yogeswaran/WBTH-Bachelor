import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

export function CardSkeleton() {
	return (
		<Card className="overflow-hidden animate-pulse">
			<CardHeader className="p-4 pb-0">
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-muted" />
						<div>
							<div className="h-4 w-24 bg-muted rounded" />
							<div className="h-3 w-32 bg-muted rounded mt-2" />
						</div>
					</div>
					<div className="h-6 w-16 bg-muted rounded" />
				</div>
			</CardHeader>
			<CardContent className="p-4">
				<div className="h-6 w-3/4 bg-muted rounded mb-2" />
				<div className="h-4 w-full bg-muted rounded" />
			</CardContent>
			<CardFooter className="p-4 pt-0 flex justify-between">
				<div className="flex gap-4">
					<div className="h-8 w-16 bg-muted rounded" />
					<div className="h-8 w-16 bg-muted rounded" />
				</div>
			</CardFooter>
		</Card>
	)
}
