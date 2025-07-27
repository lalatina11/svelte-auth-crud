<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input';
	import type { User } from '$lib/server/db/schema';
	import type { FormEventHandler } from 'svelte/elements';
	let formState = $state({
		isShowPassword: false,
		error: { identifier: '', password: '', server: '' },
		isLoading: false
	});
	const handleForm: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		const formField = Object.fromEntries(formData) as unknown as User & { identifier: string };
		const { identifier, password } = formField;
		try {
			if (identifier.trim().length < 6) {
				return (formState.error.identifier = 'Username atau Email harus diisi minimal 6 character');
			}
			const identifierTest = /^[a-zA-Z0-9@\.]+$/;
			if (!identifierTest.test(identifier)) {
				return (formState.error.identifier =
					'Username atau Email tidak boleh mengandung karakter khusus atau spasi!');
			}
			if (!password || !password.trim().length || password.trim().length < 6) {
				if (identifier.trim().length > 6 && identifierTest.test(identifier)) {
					formState.error.identifier = '';
				}
				return (formState.error.password = 'Password harus diisi minimal 6 character');
			}
			formState.error = { ...formState.error, identifier: '', password: '' };
			formState.isLoading = true;
			const res = await fetch('/api/user/login', {
				method: 'POST',
				body: JSON.stringify(formField),
				credentials: 'include'
			});
			const result = await res.json();
			if (result.error) {
				throw new Error(result.message);
			}
			return goto('/');
		} catch (error) {
			formState.error.server = (error as Error).message;
		} finally {
			formState.isLoading = false;
		}
	};
</script>

<title> register </title>

<div class="flex h-screen items-center justify-center">
	<form onsubmit={handleForm} class="m-auto w-sm space-y-4 rounded-lg border border-zinc-500 p-3">
		<span class="flex flex-col items-center justify-center text-lg font-semibold"
			>Login Into Your Account</span
		>
		<span class="flex items-center justify-center text-sm text-red-500"
			>{formState.error.server}</span
		>
		<div class="flex flex-col gap-2">
			<label for="identifier" class="text-muted-foreground block text-sm font-medium capitalize"
				>Email atau Username</label
			>
			<Input type="text" id="identifier" name="identifier" />
			<span class="w-full text-center text-sm text-red-500">{formState.error.identifier}</span>
		</div>
		<div class="flex flex-col gap-2">
			<label for="password" class="text-muted-foreground block text-sm font-medium">Password</label>
			<Input type={formState.isShowPassword ? 'text' : 'password'} id="password" name="password" />
			<span class="w-full text-center text-sm text-red-500">{formState.error.password}</span>
		</div>
		<span class="text-sm"
			>Dont have an Account? <a class="text-blue-500" href="/register">Register Here</a></span
		>
		<div class="flex items-center gap-2">
			<Checkbox
				onCheckedChange={(checked) => (formState.isShowPassword = !!checked)}
				id="showPassword"
			/>
			<label class="text-xs" for="showPassword">Show Password</label>
		</div>
		<Button type="submit" disabled={formState.isLoading} class="w-full text-center"
			>{formState.isLoading ? 'loading' : 'Login Now'}</Button
		>
	</form>
</div>
