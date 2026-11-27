// ============================================================
// /api/network-users — חיפוש והכתרת משתמשי הרשת (סופר-אדמין בלבד).
//   GET ?q=...         → רשימת משתמשים מ-Strapi (חיפוש לפי שם, אימייל או טלפון)
//   POST { ...crown }  → הכתרת משתמש לאדמין: שמירה ב-siteAdmins ועדכון app_role ב-Strapi
// ============================================================
import { json } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { STRAPI_URL } from '$lib/server/strapiAuth';
import { setSiteAdmin, getSiteAdmins, normalizePhone, DEFAULT_SITE_AVATARS, type CustomSiteMeta } from '$lib/server/siteAdmins';
import { SITE_PREDEFINED_ROLES, type StrapiUserItem } from '$lib/networkRoles';
import type { RequestHandler } from './$types';

async function authorizeSuper(locals: App.Locals): Promise<{ email: string; jwt: string } | Response> {
	const session = await locals.auth();
	const email = session?.user?.email?.trim().toLowerCase() ?? '';
	if (!email || !isSuperAdmin(email)) {
		return json({ error: 'אין הרשאה — סופר-אדמין בלבד' }, { status: 403 });
	}
	const jwt = (session!.user as { strapiJwt?: string })?.strapiJwt ?? '';
	if (!jwt) {
		return json({ error: 'חסר טוקן Strapi — נא להתחבר מחדש' }, { status: 401 });
	}
	return { email, jwt };
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const auth = await authorizeSuper(locals);
	if (auth instanceof Response) return auth;

	const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
	const normDigits = normalizePhone(q);

	try {
		// 1. ניסיון קריאה ל-endpoint הייעודי בבאקאנד
		const directRes = await fetch(`${STRAPI_URL}/api/network-users?q=${encodeURIComponent(q)}`, {
			headers: { Authorization: `Bearer ${auth.jwt}` },
			signal: AbortSignal.timeout(6000)
		});

		if (directRes.ok) {
			const jsonRes = (await directRes.json()) as { data: StrapiUserItem[] };
			return json(jsonRes);
		}
	} catch {
		/* ממשיכים ל-fallback */
	}

	// 2. Fallback: שליפה דרך chUserList (רשומים בקהילה + שאר האתרים)
	try {
		const [resComm, resOthers] = await Promise.all([
			fetch(`${STRAPI_URL}/api/ch-users?scope=community`, {
				headers: { Authorization: `Bearer ${auth.jwt}` },
				signal: AbortSignal.timeout(8000)
			}).catch(() => null),
			fetch(`${STRAPI_URL}/api/ch-users?scope=others`, {
				headers: { Authorization: `Bearer ${auth.jwt}` },
				signal: AbortSignal.timeout(8000)
			}).catch(() => null)
		]);

		const commData = resComm?.ok ? ((await resComm.json()).data as any[]) : [];
		const othersData = resOthers?.ok ? ((await resOthers.json()).data as any[]) : [];
		const allUsers = [...commData, ...othersData];

		const filtered = q
			? allUsers.filter((u) => {
					const em = String(u.email ?? '').toLowerCase();
					const un = String(u.username ?? '').toLowerCase();
					const nn = String(u.nickname ?? '').toLowerCase();
					const ph = normalizePhone(u.phone);
					return (
						em.includes(q) ||
						un.includes(q) ||
						nn.includes(q) ||
						(normDigits && ph.includes(normDigits))
					);
				})
			: allUsers;

		const mapped: StrapiUserItem[] = filtered.slice(0, 100).map((u) => ({
			id: u.id,
			email: u.email ?? '',
			username: u.username ?? '',
			nickname: u.nickname ?? '',
			phone: u.phone ?? '',
			city: u.city ?? '',
			avatarUrl: u.avatar_url ?? u.avatarUrl ?? '',
			appRole: u.app_role ?? u.appRole ?? 'user'
		}));

		return json({ data: mapped, total: filtered.length });
	} catch (e) {
		console.error('[network-users] fetch failed:', e);
		return json({ error: 'שגיאה בטעינת משתמשים מ-Strapi' }, { status: 502 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const auth = await authorizeSuper(locals);
	if (auth instanceof Response) return auth;

	let body: {
		siteId: string;
		adminName: string;
		adminEmail?: string;
		phone?: string;
		role?: string;
		communityId?: string;
		avatarUrl?: string;
		appRole?: string;
		siteMeta?: CustomSiteMeta;
	};

	try {
		body = await request.json();
	} catch {
		return json({ error: 'קלט לא תקין' }, { status: 400 });
	}

	const siteId = String(body.siteId ?? '').trim();
	const adminName = String(body.adminName ?? '').trim();
	const adminEmail = String(body.adminEmail ?? '').trim().toLowerCase();
	const phone = String(body.phone ?? '').trim();
	const role = String(body.role ?? '').trim();
	const communityId = String(body.communityId ?? '').trim();
	const avatarUrl = String(body.avatarUrl ?? '').trim();
	const appRole = String(body.appRole ?? '').trim();

	if (!siteId) return json({ error: 'siteId חסר' }, { status: 400 });

	const cleanSiteMeta: CustomSiteMeta | undefined =
		body.siteMeta && typeof body.siteMeta === 'object' && String(body.siteMeta.name ?? '').trim()
			? {
					name: String(body.siteMeta.name).trim(),
					description: String(body.siteMeta.description ?? '').trim() || undefined,
					url: String(body.siteMeta.url ?? '').trim() || undefined,
					image: String(body.siteMeta.image ?? '').trim() || undefined,
					category: body.siteMeta.category || 'קהילה'
				}
			: undefined;

	if (!adminName && !cleanSiteMeta) {
		return json({ error: 'שם אדמין חסר' }, { status: 400 });
	}

	try {
		// שמירה על התמונה והמטא-דאטה הקיימים של האתר — לא דורסים בשיוך משתמש!
		let keptAvatar: string | undefined;
		let existingMeta: CustomSiteMeta | undefined;
		try {
			const existingData = await getSiteAdmins(auth.jwt);
			const existing = existingData.admins[siteId];
			keptAvatar = existing?.avatarUrl || DEFAULT_SITE_AVATARS[siteId] || undefined;
			existingMeta = existing?.siteMeta;
		} catch {
			keptAvatar = DEFAULT_SITE_AVATARS[siteId] || undefined;
		}

		const finalSiteMeta = cleanSiteMeta ?? existingMeta;

		// 1. שמירה במפת siteAdmins (שמירה בשרת המשותף)
		await setSiteAdmin(auth.jwt, siteId, {
			adminEmail,
			adminName,
			role: role || undefined,
			phone: phone || undefined,
			communityId: communityId || undefined,
			avatarUrl: adminName ? (avatarUrl || keptAvatar) : undefined,
			siteMeta: finalSiteMeta,
			updatedAt: new Date().toISOString(),
			updatedBy: auth.email
		});

		// 2. עדכון הרשאות app_role ב-Strapi עבור המשתמש, אם הוגדר אימייל
		if (adminEmail && appRole) {
			fetch(`${STRAPI_URL}/api/network-users/set-role`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${auth.jwt}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email: adminEmail, appRole }),
				signal: AbortSignal.timeout(5000)
			}).catch(() => {
				// אם עוד לא נפרס בבאקאנד, ננסה דרך chAdminSetRole אם זה רלוונטי
				if (appRole === 'ch_admin') {
					fetch(`${STRAPI_URL}/api/ch-admins/set-role`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${auth.jwt}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ email: adminEmail, role: 'ch_admin' })
					}).catch(() => {});
				}
			});
		}

		return json({ ok: true, siteId, adminName, adminEmail, phone, role, siteMeta: finalSiteMeta });
	} catch (e: any) {
		console.error('[network-users crown failed]:', e);
		return json({ error: e?.message ?? 'שמירת המינוי נכשלה' }, { status: 502 });
	}
};
