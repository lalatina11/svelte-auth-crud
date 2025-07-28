import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { commentTable, likeTable, userTable } from '$lib/server/db/schema';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { SECRET_KEY } from '$env/static/private';

export const GET = async ({ request }: RequestEvent) => {
	try {
		const url = new URL(request.url);
		const postId = url.searchParams.get('postId');
		if (!postId || !+postId || +postId <= 0) {
			throw new Error('Invalid postId');
		}
		const comments = await db
			.select({
				id: commentTable.id,
				userId: likeTable.userId,
				description: commentTable.description
			})
			.from(commentTable)
			.where(eq(commentTable.postId, +postId));
		return json(
			{ error: false, data: comments, message: 'OK' },
			{
				status: 200
			}
		);
	} catch (error) {
		console.error(error);
		return json(
			{ error: false, data: null, message: 'OK' },
			{
				status: 400
			}
		);
	}
};

export const POST = async ({ request, cookies }: RequestEvent) => {
	try {
		const formData = await request.formData();
		const description = formData.get('description') as string;
		const postId = new URL(request.url).searchParams.get('postId');
		if (!postId || !+postId || +postId <= 0) {
			throw new Error('Invalid postId');
		}
		const token = cookies.get('user_token') as string;
		if (!token) {
			throw new Error('Not Authenticated!');
		}
		const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;
		if (!payload || !payload.id) {
			throw new Error('Not Authenticated!');
		}
		const [newComment] = await db
			.insert(commentTable)
			.values({ userId: payload.id, postId: +postId, description })
			.returning();
		const [comment] = await db
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
			.where(eq(commentTable.id, newComment.id));
		return json({ error: false, data: comment, message: 'created' }, { status: 201 });
	} catch (err) {
		return json({ error: true, data: null, message: (err as Error).message }, { status: 201 });
	}
};
