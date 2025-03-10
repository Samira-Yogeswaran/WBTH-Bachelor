import { Skeleton } from './ui/skeleton'

export default function CommentSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex gap-4">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="flex-1">
					<div className="bg-muted p-4 rounded-lg">
						<div className="flex justify-between items-start">
							<div className="space-y-2">
								<Skeleton className="h-5 w-32" />
							</div>
							<Skeleton className="h-4 w-16" />
						</div>
						<div className="mt-2 space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
