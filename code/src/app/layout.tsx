import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { AuthProvider } from '@/components/auth-provider'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Studygram',
	description:
		'Eine Plattform zum Teilen von Studienmaterialien und für bildungsbezogene Diskussionen',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<AuthProvider>
					<div className="min-h-screen flex flex-col">
						<Navigation />
						<main className="flex-1">{children}</main>
					</div>
				</AuthProvider>
			</body>
		</html>
	)
}
