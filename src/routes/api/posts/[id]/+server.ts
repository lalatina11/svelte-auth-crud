import { SECRET_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { commentTable, likeTable, postTable, userTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { RequestEvent } from '../$types';

export const GET = async ({ params, cookies }: RequestEvent & { params: { id: number } }) => {
	try {
		const { id } = params;
		if (!id) {
			throw new Error('Id Are required!');
		}
		const userToken = cookies.get('user_token');
		if (!userToken) throw new Error('Not authenticated');
		const currentUserId = (jwt.verify(userToken as string, SECRET_KEY) as JwtPayload).id;
		const [post] = await db
			.select({
				id: postTable.id,
				description: postTable.description,
				image: postTable.image,
				createdAt: postTable.createdAt,
				updatedAt: postTable.updatedAt,
				user: {
					id: userTable.id,
					username: userTable.username,
					email: userTable.email,
					avatar: userTable.avatar,
					firstName: userTable.firstName,
					lastName: userTable.lastName
				}
			})
			.from(postTable)
			.leftJoin(userTable, eq(userTable.id, postTable.userId))
			.where(eq(postTable.id, id));
		const likes = await db
			.select({ id: likeTable.id, userId: likeTable.userId })
			.from(likeTable)
			.where(eq(likeTable.postId, id));
		const comments = await db
			.select({
				id: commentTable.id,
				userId: commentTable.userId,
				description: commentTable.description,
				user: {
					id: userTable.id,
					username: userTable.username,
					email: userTable.email,
					avatar: userTable.avatar,
					firstName: userTable.firstName,
					lastName: userTable.lastName
				}
			})
			.from(commentTable)
			.leftJoin(userTable, eq(userTable.id, commentTable.userId))
			.where(eq(commentTable.postId, id));
		return json(
			{
				error: false,
				data: {
					likes,
					comments,
					isLiked: !!likes.some((like) => like.userId === currentUserId),
					likeCount: likes.length,
					post
				},
				message: 'ok'
			},
			{ status: 200 }
		);
	} catch (error) {
		return json({ error: true, data: null, message: (error as Error).message }, { status: 400 });
	}
};
