<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { PostWithUser } from '../../../types';
	import { postStore } from '$lib/stores/posts';

	const { post }: { post: PostWithUser } = $props();
	const handleDeletePost = (postId: number) => {
		postStore.deletePost(postId);
	};
</script>

<div class="flex flex-col gap-2 rounded-md border border-zinc-500 p-4">
	<span>{post.description}</span>
	{#if post.image}
		<img src={post.image} alt="..." class="max-w-screen w-full h-auto object-cover rounded-md" />
	{/if}
	<Button variant="destructive" onclick={() => handleDeletePost(post.id)}>Delete</Button>
</div>