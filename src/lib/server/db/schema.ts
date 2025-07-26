// import { relations } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', (t) => ({
	id: t.uuid().defaultRandom().primaryKey(),
	username: t.varchar({ length: 32 }).notNull().unique(),
	email: t.varchar({ length: 128 }).notNull().unique(),
	password: t.text(),
	firstName: t.varchar('first_name', { length: 64 }),
	lastName: t.varchar('last_name', { length: 64 }),
	avatar: t.text(),
	createdAt: t.timestamp('created_at').notNull().defaultNow(),
	updatedAt: t
		.timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date(Date.now()))
}));

export type User = typeof userTable.$inferSelect;

export const postTable = pgTable('posts', (t) => ({
	id: t.serial('id').primaryKey().notNull(),
	description: t.text(),
	image: t.text(),
	userId: t
		.uuid()
		.references(() => userTable.id)
		.notNull(),
	createdAt: t.timestamp('created_at').notNull().defaultNow(),
	updatedAt: t
		.timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date(Date.now()))
}));

export type Post = typeof postTable.$inferSelect;

export const commentTable = pgTable('comments', (t) => ({
	id: t.serial('id').primaryKey().notNull(),
	userId: t
		.uuid()
		.references(() => userTable.id)
		.notNull(),
	postId: t
		.serial('post_id')
		.references(() => postTable.id)
		.notNull(),
	description: t.text(),
	image: t.text(),
	createdAt: t.timestamp('created_at').notNull().defaultNow(),
	updatedAt: t
		.timestamp('updated_at')
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date(Date.now()))
}));

export type Comment = typeof commentTable.$inferSelect;

export const likeTable = pgTable('likes', (t) => ({
	id: t.serial('id').primaryKey().notNull(),
	userId: t
		.uuid()
		.references(() => userTable.id)
		.notNull(),
	postId: t.serial('post_id').references(() => postTable.id),
	commentId: t.serial('comment_id').references(() => commentTable.id),
	createdAt: t.timestamp('created_at').notNull().defaultNow(),
	updatedAt: t
		.timestamp('updated_at')
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date(Date.now()))
}));

// export const usersTableRelations = relations(userTable, ({ many }) => ({
// 	posts: many(postTable),
// 	comments: many(commentTable)
// }));
//
// export const postTableRelations = relations(postTable, ({ one }) => ({
// 	user: one(userTable)
// }));
//
// export const commentTableRelation = relations(userTable, ({ one }) => ({
// 	user: one(userTable)
// }));
