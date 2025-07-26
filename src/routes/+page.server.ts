import { db } from '$lib/server/db';
import { postTable, userTable } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { RequestEvent } from './$types';
import type { PostWithUser } from '../types';

export const load = async ({ cookies }: RequestEvent) => {
	const token = cookies.get('user_token');
	if (token) {
		const verifyToken = jwt.verify(token.toString(), process.env.SECRET_KEY || '') as JwtPayload;
		const userInformation = await db.select().from(userTable ).where(eq(userTable .id, verifyToken.id));
		if (!userInformation.length) {
			cookies.delete('user_token', { path: '/' });
			return redirect(301, '/login');
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...userInformationwWithoutPassword } = await userInformation[0];
		// console.log(password);
		const postWithUser: PostWithUser[] = await db
			.select({
				id: postTable.id,
				description: postTable.description,
				image: postTable.image,
				createdAt: postTable.createdAt,
				updatedAt: postTable.updatedAt,
				user: {
					id: userTable.id,
					username: userTable.username,
					email: userTable.email
				}
			})
			.from(postTable)
			.leftJoin(userTable, eq(userTable.id, postTable.userId));
		return { posts: postWithUser, user: userInformationwWithoutPassword };
	} else {
		return redirect(301, '/login');
	}
};
