// ============================================================
// coordinatorApplication.ts — "הגשת מועמדות" לתפקיד רכז באתר שכתוב לידו "דרוש רכז"
// (ברשימת צוות הרכזים).
//
// המועמדות נכתבת לתיבה האישית של מנהל הרשת (הסופר-אדמין) בקהילה בשכונה — item מסוג
// message ב-Strapi המשותף, בדיוק כמו "השארת הודעה" לרכז (coordinatorMessage.ts) —
// ומיד אחריה יוצא SMS לנייד שלו. כל הפרטים שהמועמד מילא נשמרים בגוף ההודעה.
//
// SMS: ה-lifecycle של items בבאקאנד כבר שולח SMS לסופר-אדמין על הודעה חדשה בתיבה.
// שולחים כאן SMS משלנו רק כשהבאקאנד לא ישלח (אותה בדיקה כמו ב-coordinatorMessage).
//
// הטופס פתוח גם למי שלא מחובר (מי שרוצה להתנדב עוד לא בהכרח רשום), ולכן הבלם נגד
// הצפת SMS הוא ריסון לפי כתובת + תקרה כללית, ושדה-פיתיון נסתר שרק בוטים ממלאים.
// ============================================================
import { getSite } from '$lib/sitesData';
import { APPLY_AVAILABILITY } from '$lib/aboutContent';
import { getPublicSiteAdmins } from '$lib/server/siteAdmins';
import { superAdminEmails } from '$lib/server/superAdmin';
import { STRAPI_URL } from '$lib/server/strapiAuth';
import {
	ContactError,
	INBOX_LINK,
	backendWillSms,
	findUserByEmail,
	headers,
	sendSms
} from '$lib/server/coordinatorMessage';

const STRAPI_TOKEN = process.env.STRAPI_TOKEN ?? '';

export const APPLICATION_LIMITS = {
	name: 80,
	phone: 20,
	email: 120,
	city: 80,
	text: 1500
} as const;

export interface CoordinatorApplication {
	siteId: string;
	name: string;
	phone: string;
	email: string;
	city: string;
	availability: string;
	advantage: string;
	experience: string;
	/** שדה-פיתיון: אדם לא רואה אותו ולא ממלא; בוט ממלא */
	website: string;
}

// ריסון נגד הצפה (זיכרון-תהליך; רשת ביטחון, לא חשבונאות): 3 מועמדויות לכתובת בשעה,
// ו-20 בשעה בסך הכל — כל מועמדות היא SMS לנייד של מנהל הרשת.
const HOUR_MS = 60 * 60_000;
const PER_CLIENT_PER_HOUR = 3;
const TOTAL_PER_HOUR = 20;
const sentByClient = new Map<string, number[]>();
let sentTotal: number[] = [];

function reserve(clientKey: string): boolean {
	const now = Date.now();
	sentTotal = sentTotal.filter((t) => now - t < HOUR_MS);
	const mine = (sentByClient.get(clientKey) ?? []).filter((t) => now - t < HOUR_MS);
	if (mine.length >= PER_CLIENT_PER_HOUR || sentTotal.length >= TOTAL_PER_HOUR) return false;
	mine.push(now);
	sentTotal.push(now);
	sentByClient.set(clientKey, mine);
	return true;
}

/** טלפון ישראלי (נייד או קווי) → 0XXXXXXXXX; מחרוזת ריקה אם לא תקין */
export function normalizePhone(raw: string): string {
	let d = raw.replace(/[\s\-().]/g, '');
	if (d.startsWith('+972')) d = '0' + d.slice(4);
	else if (d.startsWith('972')) d = '0' + d.slice(3);
	return /^0[2-9]\d{7,8}$/.test(d) ? d : '';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** מנקה שדה: מחרוזת, בלי תווי בקרה, חתוך לאורך המותר */
function clean(v: unknown, max: number): string {
	// eslint-disable-next-line no-control-regex
	return String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
}

/**
 * הגשת מועמדות לרכז של אתר. זורק ContactError עם הודעה ידידותית כשאי אפשר.
 */
export async function submitCoordinatorApplication(
	input: Partial<Record<keyof CoordinatorApplication, unknown>>,
	clientKey: string
): Promise<void> {
	// בוט: מדמים הצלחה, לא שומרים ולא שולחים SMS
	if (clean(input.website, 200)) return;

	if (!STRAPI_TOKEN) throw new ContactError('הגשת מועמדות אינה זמינה כרגע', 503);

	const site = getSite(clean(input.siteId, 60));
	if (!site) throw new ContactError('אתר לא מוכר');

	const name = clean(input.name, APPLICATION_LIMITS.name);
	const phone = normalizePhone(clean(input.phone, APPLICATION_LIMITS.phone));
	const email = clean(input.email, APPLICATION_LIMITS.email);
	const city = clean(input.city, APPLICATION_LIMITS.city);
	const advantage = clean(input.advantage, APPLICATION_LIMITS.text);
	const experience = clean(input.experience, APPLICATION_LIMITS.text);
	const availabilityRaw = clean(input.availability, 40);
	const availability = APPLY_AVAILABILITY.includes(availabilityRaw) ? availabilityRaw : '';

	if (name.length < 2) throw new ContactError('נא למלא שם מלא');
	if (!phone) throw new ContactError('נא להזין מספר טלפון תקין');
	if (email && !EMAIL_RE.test(email)) throw new ContactError('כתובת האימייל אינה תקינה');
	if (advantage.length < 10) throw new ContactError('ספרו לנו בכמה מילים מה היתרון שלכם לתפקיד');

	if (!reserve(clientKey)) throw new ContactError('הוגשו כמה מועמדויות ברצף — נסו שוב בעוד שעה', 429);

	const ownerEmail = superAdminEmails()[0];
	const owner = ownerEmail ? await findUserByEmail(ownerEmail) : null;
	if (!owner?.external_id) throw new ContactError('הגשת מועמדות אינה זמינה כרגע', 503);

	// בלי קישורים בגוף ההודעה: ה-SMS של הבאקאנד לוקח את הקישור האחרון שבטקסט,
	// ובלעדיו הוא מפנה לתיבה (/messages) — היעד הרצוי.
	const lines = [
		`🙋 מועמדות לתפקיד רכז — ${site.name}`,
		'',
		`שם: ${name}`,
		`טלפון: ${phone}`,
		...(email ? [`אימייל: ${email}`] : []),
		...(city ? [`עיר / שכונה: ${city}`] : []),
		...(availability ? [`זמינות: ${availability}`] : []),
		'',
		'מה היתרון שלי לתפקיד:',
		advantage,
		...(experience ? ['', 'ניסיון רלוונטי:', experience] : []),
		'',
		'— הוגש מרשימת צוות הרכזים באתר יוצאים לחירות'
	];

	const res = await fetch(`${STRAPI_URL}/api/items`, {
		method: 'POST',
		headers: headers(),
		body: JSON.stringify({
			data: {
				label: `🙋 מועמדות לרכז — ${site.name} — ${name}`,
				category: 'message',
				description: lines.join('\n'),
				contact: phone,
				icon: '🙋',
				color: 'purple',
				user_id: owner.external_id,
				status1: 'active',
				publishedAt: new Date().toISOString(),
				extra_fields: {
					type: 'coordinator_application',
					site_id: site.id,
					sender_name: name,
					sender_email: email,
					sender_phone: phone,
					item_label: site.name,
					read: false
				}
			}
		}),
		signal: AbortSignal.timeout(10_000)
	});
	if (!res.ok) {
		console.error('[coordinator-application] item create failed:', res.status, await res.text());
		throw new ContactError('הגשת המועמדות נכשלה — נסו שוב', 502);
	}

	// SMS עם קישור ישיר לתיבה — רק אם הבאקאנד לא שולח בעצמו. best-effort: המועמדות כבר בתיבה.
	if (backendWillSms(owner)) return;
	let ownerPhone = owner.phone || '';
	if (!ownerPhone) {
		const { admins } = await getPublicSiteAdmins().catch(() => ({ admins: {} }));
		ownerPhone =
			Object.values(admins).find((a) => a.adminEmail?.trim().toLowerCase() === ownerEmail)?.phone ?? '';
	}
	if (!ownerPhone) return;
	try {
		await sendSms(
			ownerPhone,
			`מועמדות חדשה לרכז ב${site.name}: ${name}, ${phone}. הפרטים המלאים בתיבה האישית בקהילה בשכונה:\n${INBOX_LINK}`
		);
	} catch (e) {
		console.warn('[coordinator-application] sms failed:', e instanceof Error ? e.message : e);
	}
}
