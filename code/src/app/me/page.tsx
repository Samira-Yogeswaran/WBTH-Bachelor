import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPostsList } from '@/components/user-posts-list'
import { auth } from '@/actions/auth'
import { User } from 'next-auth'
import ProfileForm from '@/components/profile-form'

export default async function ProfilePage() {
	const { user } = (await auth()) as { user: User }

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<Tabs defaultValue="profile" className="space-y-4">
				<TabsList>
					<TabsTrigger value="profile">Profil</TabsTrigger>
					<TabsTrigger value="posts">Meine Beiträge</TabsTrigger>
				</TabsList>
				<TabsContent value="profile">
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
		</div>
	)
}
