import { json, type Action } from '@sveltejs/kit';

export const POST: Action = async ({ cookies }) => {
	cookies.delete('user_token', { path: '/' });
	return json({ message: 'ok' }, { status: 200 });
};
