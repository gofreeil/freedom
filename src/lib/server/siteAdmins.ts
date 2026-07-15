// ============================================================
// אחסון מינויי האדמינים לאתרי הרשת.
// נשמר בקובץ JSON בשרת (עובד עם adapter-node / כל תהליך Node קבוע).
// מיקום הקובץ: לפי SITE_ADMINS_FILE, אחרת data/site-admins.json בתיקיית ההרצה.
//
// מבנה הקובץ:
// {
//   "community_neighborhood": { "adminEmail": "...", "adminName": "...", "updatedAt": "...", "updatedBy": "..." },
//   ...
// }
// ============================================================

import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';

export interface SiteAdmin {
	/** אימייל האדמין שמונה לאתר (זהות אחידה מול ה-Strapi המשותף) */
	adminEmail: string;
	/** שם תצוגה */
	adminName: string;
	/** מתי מונה (ISO) */
	updatedAt: string;
	/** מי מינה (אימייל הסופר-אדמין) */
	updatedBy: string;
}

export type SiteAdminsMap = Record<string, SiteAdmin>;

const FILE = process.env.SITE_ADMINS_FILE
	? resolve(process.env.SITE_ADMINS_FILE)
	: resolve(process.cwd(), 'data', 'site-admins.json');

/** קריאת כל המינויים (מפה ריקה אם הקובץ לא קיים/פגום) */
export async function getSiteAdmins(): Promise<SiteAdminsMap> {
	try {
		const raw = await fs.readFile(FILE, 'utf-8');
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? (parsed as SiteAdminsMap) : {};
	} catch {
		return {};
	}
}

async function writeAll(map: SiteAdminsMap): Promise<void> {
	await fs.mkdir(dirname(FILE), { recursive: true });
	await fs.writeFile(FILE, JSON.stringify(map, null, 2), 'utf-8');
}

/** מינוי/עדכון אדמין לאתר */
export async function setSiteAdmin(siteId: string, admin: SiteAdmin): Promise<void> {
	const map = await getSiteAdmins();
	map[siteId] = admin;
	await writeAll(map);
}

/** ביטול מינוי אדמין לאתר */
export async function removeSiteAdmin(siteId: string): Promise<void> {
	const map = await getSiteAdmins();
	if (siteId in map) {
		delete map[siteId];
		await writeAll(map);
	}
}
