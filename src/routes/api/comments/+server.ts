import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { commentTable, likeTable } from '$lib/server/db/schema';

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
