<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input';
	import type { User } from '$lib/server/db/schema';
	import type { FormEventHandler } from 'svelte/elements';
	import emailValidator from 'email-validator';
	import { goto } from '$app/navigation';
	let formState = $state({
		isShowPassword: false,
		error: { username: '', email: '', password: '', server: '' },
		isLoading: false
	});
	// const router = useRout
	const handleForm: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		const formField = Object.fromEntries(formData) as unknown as User;
		const { username, email, password } = formField;
		try {
			if (username.trim().length < 6) {
				return (formState.error.username = 'Username harus diisi minimal 6 character');
			}
			const usernameTest = /^[a-zA-Z0-9]+$/;
			if (!usernameTest.test(username)) {
				return (formState.error.username =
					'Username tidak boleh mengandung karakter khusus atau spasi');
			}

			if (!email.trim().length || !emailValidator.validate(email)) {
				if (username.trim().length >= 6 && usernameTest.test(username)) {
					formState.error.username = '';
				}
				return (formState.error.email = 'Mohon isi email yang valid');
			}
			if (!password || !password.trim().length || password.trim().length < 6) {
				if (username.trim().length >= 6 && usernameTest.test(username))
					formState.error.username = '';
				if (email.trim().length && emailValidator.validate(email)) formState.error.email = '';
				return (formState.error.password = 'Password harus diisi minimal 6 character');
			}
			formState.error = { ...formState.error, email: '', password: '', username: '' };
			formState.isLoading = true;
			const res = await fetch('/api/user/register', {
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
			>Register Your Account</span
		>
		<span class="flex items-center justify-center text-sm text-red-500"
			>{formState.error.server}</span
		>
		<div class="flex flex-col gap-2">
			<label for="username" class="text-muted-foreground block text-sm font-medium">Username</label>
			<Input type="text" id="username" name="username" />
			<span class="text-sm text-red-500">{formState.error.username}</span>
		</div>
		<div class="flex flex-col gap-2">
			<label for="email" class="text-muted-foreground block text-sm font-medium">Email</label>
			<Input type="email" id="email" name="email" />
			<span class="text-sm text-red-500">{formState.error.email}</span>
		</div>
		<div class="flex flex-col gap-2">
			<label for="password" class="text-muted-foreground block text-sm font-medium">Password</label>
			<Input type={formState.isShowPassword ? 'text' : 'password'} id="password" name="password" />
			<span class="text-sm text-red-500">{formState.error.password}</span>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox
				onCheckedChange={(checked) => (formState.isShowPassword = !!checked)}
				id="showPassword"
			/>
			<label class="text-xs" for="showPassword">Show Password</label>
		</div>
		<span>Have an Account? <a class="text-blue-500" href="/login">Login Here</a></span>
		<Button type="submit" class="w-full text-center">Register Now</Button>
	</form>
</div>
