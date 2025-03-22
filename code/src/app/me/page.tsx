import { auth } from '@/actions/auth'
import { ProfileTabs } from '@/components/profile-tabs'

export default async function ProfilePage() {
	const session = await auth()
	const user = session?.user

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<ProfileTabs user={user!} />
		</div>
	)
}
