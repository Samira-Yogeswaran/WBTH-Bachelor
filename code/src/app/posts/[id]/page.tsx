import { getPost } from '@/actions/post'
import PostContent from '@/components/post-content'
import CommentSection from '@/components/comment-section'
import { Post } from '@/types/general'
import { Separator } from '@/components/ui/separator'

export default async function PostPage({ params }: { params: { id: string } }) {
	const { id } = await params
	const { data } = (await getPost(id)) as { data: Post }

	return (
		<div className="px-8 py-6 max-w-[1000px] mx-auto">
			<PostContent content={data} />
			<Separator className="my-6" />
			<CommentSection postId={data.id} username={data.user.name} />
		</div>
	)
}
