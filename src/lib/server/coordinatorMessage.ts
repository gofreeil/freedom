// ============================================================
// coordinatorMessage.ts — "השאירו הודעה" לרכז של אתר ברשת (מרשימת צוות הרכזים).
//
// ההודעה נכתבת לתיבה האישית של הרכז בקהילה בשכונה — item מסוג message ב-Strapi
// המשותף, עם user_id = ה-external_id של הרכז (בדיוק כמו כל הודעה בקהילה) —
// ומיד אחריה יוצא SMS לנייד שלו עם קישור ישיר לתיבה.
//
// SMS: ה-lifecycle של items בבאקאנד כבר שולח SMS לנמען שהוא מנהל/רכז שכונה
// (utils/adminSms.ts). כדי שהרכז לא יקבל שני SMS על אותה הודעה, שולחים כאן
// רק כשהבאקאנד לא ישלח — אותה בדיקת תפקיד והעדפות, בשכפול מינימלי.
//
// בלי קישור בגוף ההודעה: ה-SMS של הבאקאנד לוקח את הקישור האחרון שבטקסט, ובלעדיו
// הוא מפנה לתיבה (/messages) — בדיוק היעד הרצוי.
//
// הכל בטוקן השרת (STRAPI_TOKEN) — לעולם לא מגיע לדפדפן.
// ============================================================
import { STRAPI_URL } from '$lib/server/strapiAuth';
import { getPublicSiteAdmins } from '$lib/server/siteAdmins';
import { getSite } from '$lib/sitesData';

const STRAPI_TOKEN = process.env.STRAPI_TOKEN ?? '';
const COMMUNITY_URL = 'https://community.gofreeil.com';
const INBOX_LINK = `${COMMUNITY_URL}/messages`;

export const MESSAGE_MIN = 5;
export const MESSAGE_MAX = 2000;

export class ContactError extends Error {
	constructor(
		message: string,
		public status = 400
	) {
		super(message);
	}
}

interface StrapiUserRow {
	id: number;
	email?: string | null;
	phone?: string | null;
	external_id?: string | null;
	app_role?: string | null;
	blocked?: boolean | null;
	coordinator_of?: unknown;
	sms_prefs?: unknown;
}

function headers() {
	return { 'Content-Type': 'application/json', Authorization: `Bearer ${STRAPI_TOKEN}` };
}

/** משתמש ה-Strapi של הרכז לפי האימייל שלו */
async function findUserByEmail(email: string): Promise<StrapiUserRow | null> {
	const q = new URLSearchParams({ 'filters[email][$eqi]': email, 'pagination[limit]': '1' });
	const res = await fetch(`${STRAPI_URL}/api/users?${q}`, {
		headers: headers(),
		signal: AbortSignal.timeout(10_000)
	});
	if (!res.ok) throw new Error(`users lookup ${res.status}`);
	const rows = (await res.json()) as StrapiUserRow[];
	return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

/**
 * האם ה-lifecycle של items בבאקאנד ישלח לנמען הזה SMS בעצמו.
 * משקף את notifyAdminBySms: תפקיד super_admin/neighborhood_admin או רכז שכונה,
 * לא חסום, והעדפות ה-SMS לא מכבות את קבוצת "other" (שאליה נופל הסוג שלנו).
 */
function backendWillSms(u: StrapiUserRow): boolean {
	if (u.blocked) return false;
	const privileged =
		['super_admin', 'neighborhood_admin'].includes(String(u.app_role ?? '')) ||
		(Array.isArray(u.coordinator_of) && u.coordinator_of.length > 0);
	if (!privileged) return false;
	const p = u.sms_prefs as { enabled?: unknown; groups?: unknown } | null;
	if (!p || typeof p !== 'object') return true;
	if (p.enabled === false) return false;
	return !Array.isArray(p.groups) || p.groups.map(String).includes('other');
}

async function sendSms(phone: string, message: string): Promise<void> {
	const res = await fetch(`${STRAPI_URL}/api/admin/sms/send`, {
		method: 'POST',
		headers: headers(),
		body: JSON.stringify({ message, recipients: [{ phone }] }),
		signal: AbortSignal.timeout(20_000)
	});
	if (!res.ok) throw new Error(`sms send ${res.status}`);
	const json = (await res.json()) as { results?: { ok: boolean; error?: string }[] };
	const r = json.results?.[0];
	if (!r?.ok) throw new Error(`sms failed: ${r?.error ?? 'unknown'}`);
}

// ריסון נגד הצפה (זיכרון-תהליך; רשת ביטחון, לא חשבונאות): עד 5 הודעות לשולח בשעה
const HOUR_MS = 60 * 60_000;
const PER_SENDER_PER_HOUR = 5;
const sentBySender = new Map<string, number[]>();

function reserve(senderKey: string): boolean {
	const now = Date.now();
	const mine = (sentBySender.get(senderKey) ?? []).filter((t) => now - t < HOUR_MS);
	if (mine.length >= PER_SENDER_PER_HOUR) return false;
	mine.push(now);
	sentBySender.set(senderKey, mine);
	return true;
}

/**
 * שליחת הודעה לרכז של אתר. זורק ContactError עם הודעה ידידותית כשאי אפשר.
 */
export async function sendCoordinatorMessage(input: {
	siteId: string;
	text: string;
	from: { name: string; email: string };
}): Promise<void> {
	if (!STRAPI_TOKEN) throw new ContactError('שליחת הודעות אינה זמינה כרגע', 503);

	const site = getSite(input.siteId);
	if (!site) throw new ContactError('אתר לא מוכר');
	const text = input.text.trim();
	if (text.length < MESSAGE_MIN) throw new ContactError('ההודעה קצרה מדי');
	if (text.length > MESSAGE_MAX) throw new ContactError('ההודעה ארוכה מדי');

	const admin = (await getPublicSiteAdmins()).admins[input.siteId];
	const adminEmail = admin?.adminEmail?.trim().toLowerCase() ?? '';
	if (!admin || !adminEmail)
		throw new ContactError('לרכז של האתר הזה עוד אין תיבת הודעות בקהילה בשכונה — אפשר לפנות במייל');

	const user = await findUserByEmail(adminEmail);
	if (!user?.external_id)
		throw new ContactError('לרכז של האתר הזה עוד אין תיבת הודעות בקהילה בשכונה — אפשר לפנות במייל');

	if (!reserve(input.from.email.toLowerCase()))
		throw new ContactError('שלחת כמה הודעות ברצף — נסו שוב בעוד שעה', 429);

	const fromName = input.from.name.trim() || input.from.email;
	const res = await fetch(`${STRAPI_URL}/api/items`, {
		method: 'POST',
		headers: headers(),
		body: JSON.stringify({
			data: {
				label: `✉️ פנייה מ${fromName} — ${site.name}`,
				category: 'message',
				description:
					`${text}\n\n— נשלח מרשימת צוות הרכזים באתר יוצאים לחירות\n` +
					`להשיב: ${input.from.email}`,
				contact: input.from.email,
				icon: '✉️',
				color: 'purple',
				user_id: user.external_id,
				status1: 'active',
				publishedAt: new Date().toISOString(),
				extra_fields: {
					type: 'network_contact',
					site_id: site.id,
					sender_name: fromName,
					sender_email: input.from.email,
					item_label: site.name,
					read: false
				}
			}
		}),
		signal: AbortSignal.timeout(10_000)
	});
	if (!res.ok) {
		console.error('[coordinator-message] item create failed:', res.status, await res.text());
		throw new ContactError('שליחת ההודעה נכשלה — נסו שוב', 502);
	}

	// SMS עם קישור ישיר לתיבה — רק אם הבאקאנד לא שולח בעצמו. best-effort: ההודעה כבר בתיבה.
	if (backendWillSms(user)) return;
	const phone = admin.phone || user.phone || '';
	if (!phone) return;
	try {
		await sendSms(
			phone,
			`שלום ${admin.adminName || ''}, יש לך הודעה חדשה מ${fromName} (${site.name}) בתיבה האישית בקהילה בשכונה:\n${INBOX_LINK}`
		);
	} catch (e) {
		console.warn('[coordinator-message] sms failed:', e instanceof Error ? e.message : e);
	}
}
