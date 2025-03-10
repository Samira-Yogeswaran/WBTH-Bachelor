'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, LogOut, FileText } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'

export function Navigation() {
	const pathname = usePathname()
	const { user, isLoading } = useAuth()

	const isActive = (path: string) => pathname === path

	const handleSignOut = async () => {
		await signOut({ callbackUrl: '/' })
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center px-8 max-w-[1400px] mx-auto">
				<div className="flex gap-6 items-center">
					<Link href="/" className="flex items-center gap-2">
						<span className="font-bold text-xl">Studygram</span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="flex mx-6 items-center space-x-6 flex-1">
					<Link
						href="/"
						className={`text-sm font-medium transition-colors hover:text-primary ${
							isActive('/') ? 'text-primary' : 'text-muted-foreground'
						}`}
					>
						Feed
					</Link>
					<Link
						href="/posts/new"
						className={`text-sm font-medium transition-colors hover:text-primary ${
							isActive('/posts/new') ? 'text-primary' : 'text-muted-foreground'
						}`}
					>
						Neuer Beitrag
					</Link>
				</nav>

				<div className="flex items-center gap-2">
					{!isLoading && user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="rounded-full">
									<Avatar className="h-8 w-8">
										<AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/me">
										<User className="mr-2 h-4 w-4" />
										Profil bearbeiten
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/me#posts">
										<FileText className="mr-2 h-4 w-4" />
										Meine Beiträge
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleSignOut}>
									<LogOut className="mr-2 h-4 w-4" />
									Abmelden
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild>
							<Link href="/login">Anmelden</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	)
}
