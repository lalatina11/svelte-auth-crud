<script lang="ts">
	import { goto } from '$app/navigation';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import Posts from '$lib/components/posts/Posts.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { postStore } from '$lib/stores/posts';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import SwitchCamera from '@lucide/svelte/icons/switch-camera';
	import type { FormEventHandler } from 'svelte/elements';
	import type { PostWithUser } from '../types';
	import type { PageProps } from './$types';

	// interface PostWithUser extends Post {
	// 	posts: Post[];
	// 	users: User[];
	// }

	let { data }: PageProps = $props();

	interface FormState {
		fields: {
			description: string;
			image: null | File;
			imagePreview: string | null;
		};
		error: string;
		isLoading: boolean;
	}

	let formState = $state<FormState>({
		fields: { description: '', image: null, imagePreview: null },
		error: '',
		isLoading: false
	});

	const handleAddPost: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		try {
			if (!formState.fields.description.trim().length && !formState.fields.imagePreview) return;
			formState.isLoading = true;
			// const fakePost: PostWithUser = {
			// 	id: Math.random(),
			// 	description: formState.fields.description,
			// 	image: formState.fields.imagePreview,
			// 	user: { ...data.user }
			// };
			const formData = new FormData();
			if (formState.fields.image && !formState.fields.image.type.startsWith('image')) {
				throw new Error('Only Image allowed!');
			}

			formData.append('image', formState.fields.image || '');
			formData.append('description', formState.fields.description);
			const res = await fetch('/api/posts', {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});
			const newPost = (await res.json()) as PostWithUser;
			postStore.insertPost(newPost);
			formState.fields = { description: '', image: null, imagePreview: null };
			formState.error = '';
		} catch (error) {
			formState.error = (error as Error).message;
			console.log(error);
		} finally {
			formState.isLoading = false;
			form.reset();
		}
	};

	const handleResetImage = () => {
		formState.fields = { ...formState.fields, image: null, imagePreview: '' };
	};
	postStore.setPosts(
		data.posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) || []
	);
</script>

<title>Home</title>
<div>
	<main>
		<ModeToggle />
		<Button
			onclick={async (e) => {
				e.preventDefault();
				await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
				return goto('/login');
			}}
			variant="destructive">Logout
		</Button
		>
		<span>hello {data.user.username}</span>
		<form
			class="m-auto my-10 w-sm space-y-6 rounded-md border border-zinc-500 p-3"
			onsubmit={handleAddPost}
		>
			<span class="text-sm text-red-500">
				{formState.error ?? null}
			</span>
			<Textarea bind:value={formState.fields.description} />
			<Input
				hidden
				type="file"
				accept="*"
				onchange={(e) => {
					const target = e.target as HTMLInputElement;
					const file = target.files?.[0];
					if (file) {
						formState.fields.image = file;
						formState.fields.imagePreview = URL.createObjectURL(file);
					}
				}}
				id="image"
			/>
			{#if formState.fields.imagePreview}
				<div class="relative w-full">
					<img src={formState.fields.imagePreview} alt="..." />
					<button
						type="button"
						onclick={handleResetImage}
						class={'absolute top-0 right-0 w-full' + buttonVariants({ variant: 'destructive' })}
					>X
					</button
					>
				</div>
			{/if}
			<div class="flex items-center gap-2">
				<Label for="image" style="cursor: pointer;"
							 class={'' + buttonVariants({ variant: 'default', size: 'icon' })}>
					{#if formState.fields.imagePreview}
						<SwitchCamera />
					{:else}
						<ImagePlus />
					{/if}
				</Label>
				<span class="text-xs">{formState.fields.imagePreview ? "Change Image" : "Add Image"}</span>
			</div>

			<Button class="flex w-full text-center" disabled={formState.isLoading} type="submit"
			>{formState.isLoading ? 'loading..' : 'new post'}</Button
			>
		</form>
		<Posts />
	</main>
</div>
