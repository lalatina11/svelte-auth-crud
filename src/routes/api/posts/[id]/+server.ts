import { SECRET_KEY } from "$env/static/private";
import { db } from "$lib/server/db";
import { commentTable, likeTable } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { RequestEvent } from "../$types";

export const GET = async ({ params, cookies }: RequestEvent & { params: { id: number } }) => {
    try {
        const { id } = await params
        if (!id) {
            throw new Error("Id Are required!")
        }
        const userToken = cookies.get("user_token")
        if (!userToken) throw new Error("Not authenticated")
        const currentUserId = (jwt.verify(userToken as string, SECRET_KEY) as JwtPayload).id
        const likes = await db
            .select({ id: likeTable.id, userId: likeTable.userId })
            .from(likeTable)
            .where(eq(likeTable.postId, id));
        const comments = await db.select({ id: commentTable.id, userId: commentTable.userId, description: commentTable.description }).from(commentTable).where(eq(commentTable.postId, id))
        return json({ error: false, data: { likes, comments, isLiked: !!likes.some(like => like.userId === currentUserId), likeCount: likes.length }, message: "ok" }, { status: 200 })
    } catch (error) {
        return json({ error: true, data: null, message: (error as Error).message }, { status: 400 })
    }
}