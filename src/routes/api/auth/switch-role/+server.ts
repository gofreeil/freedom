import { json } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const session = await locals.auth();
	const email = session?.user?.email?.trim().toLowerCase();
	const isRealSuper = isSuperAdmin(email);

	// מוודא שהמשתמש הוא באמת סופר אדמין
	if (!isRealSuper) {
		return json({ error: 'מורשה לסופר אדמין בלבד' }, { status: 403 });
	}

	const body = await request.json().catch(() => ({}));
	const role = String(body.role ?? '').trim();

	if (role === 'super_admin') {
		cookies.delete('super_view_role', { path: '/' });
	} else if (role === 'admin' || role === 'user' || role === 'guest') {
		cookies.set('super_view_role', role, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 ימים
		});
	} else {
		return json({ error: 'תפקיד לא תקין' }, { status: 400 });
	}

	return json({ success: true, role });
};
