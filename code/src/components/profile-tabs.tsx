'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPostsList } from '@/components/user-posts-list'
import { User } from 'next-auth'
import ProfileForm from '@/components/profile-form'

interface ProfileTabsProps {
	user: User
}

export function ProfileTabs({ user }: ProfileTabsProps) {
	const [activeTab, setActiveTab] = useState('me')

	useEffect(() => {
		if (window.location.hash === '#posts') {
			setActiveTab('posts')
		}
	}, [])

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
			<TabsList>
				<TabsTrigger value="me">Profil</TabsTrigger>
				<TabsTrigger value="posts">Meine Beiträge</TabsTrigger>
			</TabsList>
			<TabsContent value="me">
				<ProfileForm user={user} />
			</TabsContent>
			<TabsContent value="posts">
				<Card>
					<CardHeader>
						<CardTitle>My Posts</CardTitle>
						<CardDescription>
							Sehen und verwalten Sie Ihre hochgeladenen Dokumente und Beiträge.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<UserPostsList userId={user.id} />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	)
}
