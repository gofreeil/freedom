import { createHash } from 'crypto';

// ============================================================
// יצירת כתובת אווטאר מאימייל דרך Gravatar.
// d=identicon → אם למשתמש אין תמונת Gravatar, מתקבל עיגול גיאומטרי
// ייחודי הנגזר מהאימייל (במקום תמונה ריקה).
// ============================================================
export function gravatarUrl(email: string, size = 160): string {
	const normalized = email.trim().toLowerCase();
	const hash = createHash('md5').update(normalized).digest('hex');
	return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
