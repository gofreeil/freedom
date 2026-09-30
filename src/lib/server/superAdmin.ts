// ============================================================
// הרשאת כניסה לפאנל הסופר-אדמין (/admin — "ניהול הרשת").
// כרגע מוגבל לאימייל אחד. להוספת מורשים — הוסיפו לרשימה (באותיות קטנות).
// ============================================================

const SUPER_ADMINS = ['yahavanter@gmail.com'];

/** רשימת הסופר-אדמינים (למשל כחברי צוות בלוח המשימות) */
export function superAdminEmails(): readonly string[] {
	return SUPER_ADMINS;
}

/** האם האימייל שייך לסופר-אדמין המורשה לנהל את כל הרשת */
export function isSuperAdmin(email: string | null | undefined): boolean {
	if (!email) return false;
	return SUPER_ADMINS.includes(email.trim().toLowerCase());
}
