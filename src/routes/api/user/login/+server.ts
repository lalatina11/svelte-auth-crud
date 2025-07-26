import { SECRET_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { userTable, type User } from '$lib/server/db/schema';
import { json, type Action } from '@sveltejs/kit';
import { compareSync } from 'bcrypt-ts';
import { eq, or } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export const POST: Action = async ({ cookies, request: req }) => {
	try {
		if (cookies.get('user_token')) throw new Error('anda sudah login');
		const { identifier, password } = (await req.json()) as User & { identifier: string };
		const findUser = await db
			.select()
			.from(userTable)
			.where(or(eq(userTable.username, identifier), eq(userTable.email, identifier)));
		if (!findUser.length) {
			throw new Error('Pengguna tidak ditemukan');
		}
		const { password: passwordFromDb, id } = findUser[0];
		if (!password || !passwordFromDb)
			throw new Error(
				'sepertinya anda membuat akun menggunakan google silahkan login menggunakan google'
			);
		const verifyPassword = compareSync(password, passwordFromDb);
		if (!verifyPassword) {
			throw new Error('Password tidak valid');
		}

		const token = jwt.sign({ id }, SECRET_KEY, { expiresIn: 60 * 60 * 24 * 7 });
		cookies.set('user_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		});
		return json({ message: 'OK', error: false }, { status: 200 });
	} catch (error) {
		return json({ message: (error as Error).message, error: true }, { status: 200 });
	}
};
