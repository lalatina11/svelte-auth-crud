import {
	IMAGEKIT_PRIVATE_KEY,
	IMAGEKIT_PUBLIC_KEY,
	IMAGEKIT_URL_ENDPOINT,
	SECRET_KEY
} from '$env/static/private';
import { db } from '$lib/server/db';
import { postTable, userTable } from '$lib/server/db/schema';
import { json, type Action } from '@sveltejs/kit';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import ImageKit from 'imagekit';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export const GET = async () => {
	const allposts = await db.select().from(postTable);
	return json(allposts, { status: 200 });
};

export const POST: Action = async (ctx) => {
	try {
		ctx.request.headers.append('Access-Control-Allow-Origin', '*');
		const formData = await ctx.request.formData();
		const image = formData.get('image') as File | null;
		const description = formData.get('description') as string;
		const token = ctx.cookies.get('user_token');
		if (!token) {
			throw new Error('Not Authenticated!');
		}
		const { id } = jwt.verify(token, SECRET_KEY) as JwtPayload;
		if (!image && !description.trim().length) throw new Error('Mohon isi salah satu form field');
		let imageUrl = '';
		if (image) {
			const arrayBuffer = await image.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const imagekit = new ImageKit({
				publicKey: IMAGEKIT_PUBLIC_KEY,
				urlEndpoint: IMAGEKIT_URL_ENDPOINT,
				privateKey: IMAGEKIT_PRIVATE_KEY
			});

			// URL generation
			const res = await imagekit.upload({
				file: buffer,
				fileName: image.name,
				folder: 'svelte-kit/post'
			});
			imageUrl = res.url;
		}
		const [newPost] = await db
			.insert(postTable)
			.values({
				userId: id,
				image: imageUrl,
				description
			})
			.returning();

		// Now fetch the new post with user info
		const [postWithUser] = await db
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
					avatar:userTable.avatar,
					firstName:userTable.firstName,
					lastName:userTable.lastName,
				}
			})
			.from(postTable)
			.leftJoin(userTable, eq(userTable.id, newPost.userId))
			.where(eq(postTable.id, newPost.id));

		return json(postWithUser, { status: 201 });
	} catch (error) {
		return json({ message: (error as Error).message, error: true }, { status: 201 });
	}
};
