import { json, type RequestEvent } from '@sveltejs/kit';
import { likeTable, postTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const GET = async ({ request }: RequestEvent) => {
	try {
		const url = new URL(request.url);
		const postId = url.searchParams.get('postId');
		if (!postId || !+postId || +postId <= 0) {
			throw new Error('Invalid postId');
		}
		const likes = await db
			.select({ userId: likeTable.userId })
			.from(likeTable)
			.where(eq(postTable.id, +postId));
		return json({ error: false, data: likes, message: 'OK' }, { status: 200 });
	} catch (error) {
		return json({ error: false, data: null, message: (error as Error).message }, { status: 200 });
	}
};
