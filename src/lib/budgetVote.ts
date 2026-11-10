// ============================================================
// הצבעה על חלוקת התקציב (/budget) — מודל הנתונים והחישובים.
//
// כל מצביע מחלק 100% בין סעיפי התקציב. התוצאה היא ממוצע ההצבעות, כלומר לכל
// מצביע יש חלק שווה בתקציב שהוא מכוון כרצונו — ולכן אין "הצבעה מבוזבזת".
//
// הקוד כאן טהור (בלי דפדפן ובלי רשת), כדי שירוץ כמו שהוא גם בשרת כשההצבעה
// תהפוך לאמיתית: parseAllocation מאמת הצבעה שהגיעה מהדפדפן, ו-averageAllocation
// מחשב את התוצאה. כרגע הדף מזין אותו בנתוני דוגמה.
// ============================================================

export interface BudgetCategory {
	id: string;
	label: string;
	color: string;
	/** הסכום בתקציב הנוכחי (₪) — נקודת הייחוס שמולה מצביעים */
	amount: number;
}

/** סבב הצבעה אחד על חלוקת התקציב */
export interface BudgetRound {
	id: string;
	/** הסכום שמחלקים (₪) */
	total: number;
	categories: BudgetCategory[];
	/** מועד סגירת ההצבעה (ISO) */
	closesAt: string;
	/** כמה בעלי זכות הצבעה יש */
	eligible: number;
}

/** מזהה סעיף → אחוז שלם (0–100). הצבעה תקינה מסתכמת ב-100 בדיוק. */
export type Allocation = Record<string, number>;

export interface Ballot {
	alloc: Allocation;
	/** מתי נשמרה (ISO) */
	at: string;
}

export const nis = (n: number) => `₪${n.toLocaleString('he-IL')}`;

export function allocationSum(alloc: Allocation, ids: string[]): number {
	return ids.reduce((s, id) => s + (alloc[id] ?? 0), 0);
}

export function sameAllocation(a: Allocation, b: Allocation, ids: string[]): boolean {
	return ids.every((id) => (a[id] ?? 0) === (b[id] ?? 0));
}

/**
 * מעגל ערכים למספרים שלמים ששומרים על היחס ביניהם ומסתכמים בדיוק ב-total
 * (שיטת השארית הגדולה) — כדי שאחוזים מעוגלים לא יסתכמו ב-99 או ב-101.
 * כשכל הערכים 0 — מחלק שווה בשווה.
 */
export function roundToTotal(values: number[], total = 100): number[] {
	if (!values.length) return [];
	const sum = values.reduce((s, v) => s + v, 0);
	const exact = values.map((v) => (sum > 0 ? (v / sum) * total : total / values.length));
	const out = exact.map(Math.floor);
	let rest = total - out.reduce((s, v) => s + v, 0);
	const byFraction = exact
		.map((v, i) => ({ i, frac: v - Math.floor(v) }))
		.sort((a, b) => b.frac - a.frac || a.i - b.i);
	for (const { i } of byFraction) {
		if (rest-- <= 0) break;
		out[i]++;
	}
	return out;
}

const toAllocation = (ids: string[], values: number[]): Allocation =>
	Object.fromEntries(ids.map((id, i) => [id, values[i]]));

/** התקציב הנוכחי באחוזים */
export function currentAllocation(round: BudgetRound): Allocation {
	return toAllocation(
		round.categories.map((c) => c.id),
		roundToTotal(round.categories.map((c) => c.amount))
	);
}

/** ממוצע ההצבעות באחוזים שלמים שמסתכמים ב-100; null כשאין הצבעות */
export function averageAllocation(ballots: Allocation[], ids: string[]): Allocation | null {
	if (!ballots.length) return null;
	return toAllocation(ids, roundToTotal(ids.map((id) => ballots.reduce((s, b) => s + (b[id] ?? 0), 0))));
}

/**
 * משלים חלוקה ל-100% בלי לגעת במה שהמצביע קבע בעצמו: את היתרה (או החריגה)
 * מחלקים באופן יחסי בין הסעיפים שהוא לא הזיז. אם הזיז את כולם, או שזה לא
 * מספיק — בין כולם חוץ מהאחרון שהזיז.
 * @param touched הסעיפים שהמצביע שינה, לפי הסדר (האחרון בסוף)
 */
export function rebalance(alloc: Allocation, ids: string[], touched: string[] = []): Allocation {
	const sum = allocationSum(alloc, ids);
	if (sum === 100) return alloc;
	const last = touched[touched.length - 1];
	const attempts = [ids.filter((id) => !touched.includes(id)), ids.filter((id) => id !== last), ids];
	for (const free of attempts) {
		if (!free.length) continue;
		const target = 100 - (sum - allocationSum(alloc, free));
		if (target < 0) continue;
		const scaled = roundToTotal(
			free.map((id) => alloc[id] ?? 0),
			target
		);
		return { ...alloc, ...toAllocation(free, scaled) };
	}
	return alloc;
}

/**
 * מאמת הצבעה שהגיעה ממקור לא מהימן (אחסון מקומי, ובהמשך גוף בקשה): אחוז שלם
 * 0–100 לכל סעיף, שמסתכמים ב-100. מחזיר חלוקה נקייה, או null כשאינה תקינה.
 */
export function parseAllocation(raw: unknown, ids: string[]): Allocation | null {
	if (!raw || typeof raw !== 'object') return null;
	const src = raw as Record<string, unknown>;
	const out: Allocation = {};
	for (const id of ids) {
		const v = src[id];
		if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 100) return null;
		out[id] = v;
	}
	return allocationSum(out, ids) === 100 ? out : null;
}
