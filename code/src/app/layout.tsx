import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

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
				<div className="min-h-screen flex flex-col">
					<div />
					<main className="flex-1">{children}</main>
				</div>
			</body>
		</html>
	)
}
