// ============================================================
// הרשאת כניסה לפאנל הסופר-אדמין (src/routes/admin).
// כרגע מוגבל לאימייל אחד. להוספת מורשים — הוסיפו לרשימה (באותיות קטנות).
// ============================================================

const SUPER_ADMINS = ['yahavanter@gmail.com'];

/** האם האימייל שייך לסופר-אדמין המורשה לנהל את כל הרשת */
export function isSuperAdmin(email: string | null | undefined): boolean {
	if (!email) return false;
	return SUPER_ADMINS.includes(email.trim().toLowerCase());
}
