import { db } from '$lib/server/db';
import { userTable, type User } from '$lib/server/db/schema';
import { json, type Action } from '@sveltejs/kit';
import { hashSync } from 'bcrypt-ts';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { SECRET_KEY } from '$env/static/private';
import { eq } from 'drizzle-orm';

export const POST: Action = async ({ cookies, request: req }) => {
	try {
		if (cookies.get('user_token')) throw new Error('anda sudah login');
		const { username, email, password: passwordInput } = (await req.json()) as User;
		const isUsernameExists = await db
			.select()
			.from(userTable)
			.where(eq(userTable.username, username));
		if (isUsernameExists.length) {
			throw new Error('Username sudah dipakai orang lain!');
		}
		const isEmailExists = await db.select().from(userTable).where(eq(userTable.email, email));
		if (isEmailExists.length) {
			throw new Error('Email sudah dipakai orang lain!');
		}
		if (!passwordInput) throw new Error('password are required');
		const password = hashSync(passwordInput, 12);
		const newUser = await db.insert(userTable).values({ email, username, password }).returning();
		const token = jwt.sign({ id: newUser[0].id }, SECRET_KEY, { expiresIn: 60 * 60 * 24 * 7 });
		cookies.set('user_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7
		});
		return json({ message: 'OK', error: false }, { status: 200 });
	} catch (error) {
		return json({ message: (error as Error).message, error: true }, { status: 400 });
	}
};
