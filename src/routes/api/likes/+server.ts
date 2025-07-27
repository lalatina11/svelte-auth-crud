import { json, type RequestEvent } from '@sveltejs/kit';
import { likeTable, postTable } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import jwt, { type JwtPayload } from "jsonwebtoken"
import { SECRET_KEY } from "$env/static/private"
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

export const POST = async ({ cookies, url }: RequestEvent) => {
	try {
		const userToken = cookies.get("user_token") as string
		if (!userToken) {
			throw new Error("Not Authenticated!")
		}
		const postId = url.searchParams.get("postId")
		// if (!postId || !+postId) {
		// 	throw new Error("Invalid Post Id")
		// }
		const commentId = url.searchParams.get("commentId")
		// if (!commentId || !+commentId) {
		// 	throw new Error("Invalid Post Id")
		// }
		const isLikePostSection = postId && +postId && !commentId
		const isLikeCommentSection = commentId && +commentId && !postId
		const payload = jwt.verify(userToken as string, SECRET_KEY) as JwtPayload
		console.log(payload.id, postId, commentId);
		let existingLike;
		if (isLikePostSection) {
			const [findLike] = await db.select({ id: likeTable.id }).from(likeTable).where(and(eq(likeTable.postId, +postId), eq(likeTable.userId, payload.id as string)))
			existingLike = findLike
		} else if (isLikeCommentSection) {
			const [findLike] = await db.select({ id: likeTable.id }).from(likeTable).where(and(eq(likeTable.commentId, +commentId), eq(likeTable.userId, payload.id as string)))
			existingLike = findLike

		}
		if (existingLike) {
			await db.delete(likeTable).where(eq(likeTable.id, existingLike.id))
		} else {
			if (isLikePostSection) {
				await db.insert(likeTable).values({ userId: payload.id, postId: Number(postId) })
			} else if (isLikeCommentSection) {
				await db.insert(likeTable).values({ userId: payload.id, commentId: Number(postId) })
			}
		}

		return json({ error: false, message: "OK" }, { status: 200 })
	} catch (error) {
		console.log(error);
		return json({ error: true, message: (error as Error).message }, { status: 400 })
	}
}