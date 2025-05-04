import { getUser } from '@/actions/auth'
import { ProfileTabs } from '@/components/profile-tabs'

export default async function ProfilePage() {
	const user = await getUser()

	if (!user) {
		return (
			<div className="container mx-auto px-4 py-6 max-w-4xl">
				<p className="text-center text-lg">Bitte anmelden, um Ihr Profil zu sehen.</p>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<ProfileTabs user={user!} />
		</div>
	)
}
