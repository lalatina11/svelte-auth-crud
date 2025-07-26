<script lang="ts">
	import { postStore } from '$lib/stores/posts';
	import SinglePost from '$lib/components/posts/SinglePost.svelte';
</script>

<div class="m-auto flex max-w-sm flex-col gap-10">
	{#each $postStore as post (post.id)}
		<SinglePost post={post} />
	{/each}
</div>
