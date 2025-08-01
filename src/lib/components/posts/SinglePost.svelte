<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import type { PostWithUser } from '../../../types';
	import { Button } from '../ui/button';
	import * as Card from '$lib/components/ui/card';

	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { FormEventHandler } from 'svelte/elements';

	const { post }: { post: PostWithUser } = $props();
	// const handleDeletePost = (postId: number) => {
	// 	postStore.deletePost(postId);
	// };

	interface Like {
		id: number;
		userId: string;
	}

	interface Comment {
		id: number;
		userId: string;
		description: string;
		user: {
			id: string;
			username: string;
			email: string;
			avatar: string;
			firstName: string;
			lastName: string;
		};
	}

	interface PostState {
		likes: Like[];
		comments: Comment[];
		isLiked?: boolean;
		likeCount?: number;
		isCommentSection?: boolean;
	}

	let postState = $state<PostState>({ likes: [], comments: [], likeCount: 0 });
	let formAddCommentState = $state({ description: '', isLoading: false });
	const getLikesAndComments = async () => {
		const res = await fetch('/api/posts/' + post.id, { credentials: 'include' });
		const { data } = await res.json() as { data: PostState };
		postState = data;
	};

	$effect(() => {
		getLikesAndComments();
	});

	const handleLike = async () => {
		await fetch('/api/likes?postId=' + post.id, {
			method: 'POST',
			credentials: 'include'
		});
		postState = {
			...postState,
			isLiked: !postState.isLiked,
			likeCount: postState.isLiked
				? Number(postState.likeCount) - 1
				: Number(postState.likeCount) + 1
		};
	};

	const handleSetCommentSection = () => {
		postState.isCommentSection = !postState.isCommentSection;
	};

	const handleAddComment: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('description', formAddCommentState.description);
		try {

			formAddCommentState.isLoading = true;
			const res = await fetch('/api/comments?postId=' + post.id, {
				method: 'POST',
				credentials: 'include',
				body: formData
			});
			const { data } = await res.json() as { data: Comment };
			postState.comments = [data, ...postState.comments];
			postState.isCommentSection = true;
			formAddCommentState.description = '';
			toast.success('Berhasil menambahkan komentar');
		} catch (e) {
			console.log(e);
			toast.error('Gagal menambahkan komentar');
		} finally {
			formAddCommentState.isLoading = false;
		}
	};


</script>

<Card.Root class="flex flex-col gap-2 rounded-md border border-zinc-500 p-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Avatar.Root>
				<Avatar.Image src={post.user.avatar||""} alt="@shadcn" />
				<Avatar.Fallback>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M12 19.2c-2.5 0-4.71-1.28-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.23 7.23 0 0 1-6 3.2M12 5a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-3A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
						/>
					</svg
					>
				</Avatar.Fallback>
			</Avatar.Root>
			<span
			>{post.user.firstName && post.user.lastName
				? post.user.firstName + ' ' + post.user.lastName
				: post.user.username}</span
			>
		</div>
		<span>opt</span>
	</div>
	<span>{post.description}</span>
	{#if post.image}
		<img src={post.image} alt="..." class="h-auto w-full max-w-screen rounded-md object-cover" />
	{/if}
	<div class="flex items-center justify-between">
		<Button onclick={handleLike} class="flex items-center gap-1">
			{#if postState.isLiked}
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
				>
					<path
						fill="currentColor"
						d="M23 10a2 2 0 0 0-2-2h-6.32l.96-4.57c.02-.1.03-.21.03-.32c0-.41-.17-.79-.44-1.06L14.17 1L7.59 7.58C7.22 7.95 7 8.45 7 9v10a2 2 0 0 0 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73zM1 21h4V9H1z"
					/>
				</svg
				>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
				>
					<path
						fill="currentColor"
						d="M5 9v12H1V9zm4 12a2 2 0 0 1-2-2V9c0-.55.22-1.05.59-1.41L14.17 1l1.06 1.06c.27.27.44.64.44 1.05l-.03.32L14.69 8H21a2 2 0 0 1 2 2v2c0 .26-.05.5-.14.73l-3.02 7.05C19.54 20.5 18.83 21 18 21zm0-2h9.03L21 12v-2h-8.79l1.13-5.32L9 9.03z"
					/>
				</svg
				>
			{/if}
			<span>{postState.likeCount && postState.likeCount > 0 ? postState.likeCount : null}</span>
		</Button>
		<Button onclick={handleSetCommentSection}>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M9 22a1 1 0 0 1-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29z"
				/>
			</svg
			>
			<span> Comments </span>
		</Button>
		<Button>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
			>
				<path fill="currentColor" d="m21 12l-7-7v4C7 10 4 15 3 20c2.5-3.5 6-5.1 11-5.1V19z" />
			</svg
			>
			<span> Share </span>
		</Button>
	</div>
	<Separator class="my-2 mt-3" />
	<div class="flex flex-col gap-3">
		<form onsubmit={handleAddComment}>
			<div class="flex gap-3">
				<Textarea name="description" class="flex-1" placeholder="tambahkan komentar"
									bind:value={formAddCommentState.description} />
				{#if formAddCommentState.description.trim().length && !formAddCommentState.isLoading}
					<Button disabled={formAddCommentState.isLoading||!formAddCommentState.description.trim().length}
									type="submit">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
								 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
								 class="lucide lucide-send-horizontal-icon lucide-send-horizontal">
							<path
								d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
							<path d="M6 12h16" />
						</svg>
					</Button>
				{/if}
			</div>
		</form>
		{#if postState.isCommentSection && !!postState.comments.length}
			<span class="text-xs">Postingan ini memiliki {postState.comments.length} Komentar</span>
			{#each postState.comments as comment (comment.id)}
				<div class="flex flex-col gap-2 p-2 border border-zinc-500 rounded-md">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Avatar.Root>
								<Avatar.Image src={post.user.avatar||""} alt="@shadcn" />
								<Avatar.Fallback>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M12 19.2c-2.5 0-4.71-1.28-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.23 7.23 0 0 1-6 3.2M12 5a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-3A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
										/>
									</svg
									>
								</Avatar.Fallback>
							</Avatar.Root>
							<span
							>{post.user.firstName && post.user.lastName
								? post.user.firstName + ' ' + post.user.lastName
								: post.user.username}</span
							>
						</div>
						<span>opt</span>
					</div>
					<span class="text-sm px-2">{comment.description}</span>
				</div>
			{/each            }
		{:else if postState.isCommentSection && !postState.comments.length}
			<span class="text-xs text-center">Postingan ini belum memiliki komentar</span>
		{/if}
	</div>
</Card.Root>
