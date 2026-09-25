// ============================================================
// aboutContent.ts — הטקסטים של דף האודות (/about) ורשימת הרכזים, בשלוש השפות.
//
// מוחזק כאן ולא ב-i18n.ts: טקסט מותג ארוך, שנוח יותר לתחזק כשכל שפה
// עומדת לבדה ברצף אחד. השו"ת (aboutFaq.ts) עדיין בעברית בלבד — בעריכה.
// ============================================================

export type AboutLang = 'he' | 'en' | 'ru';

/** 'en-US' / 'ru' / undefined → אחת משלוש השפות (ברירת מחדל: עברית). */
export function aboutLang(locale: string | null | undefined): AboutLang {
	const code = (locale ?? 'he').slice(0, 2);
	return code === 'en' || code === 'ru' ? code : 'he';
}

interface Principle {
	icon: string;
	title: string;
	text: string;
}

export interface AboutText {
	dir: 'rtl' | 'ltr';
	title: string;
	tagline: string;
	logoAlt: string;
	intro: string[];
	sitesTitle: string;
	principlesTitle: string;
	principles: Principle[];
	joinTitle: string;
	joinText: string;
	register: string;
	login: string;
	contact: string;
	socials: { facebook: string; youtube: string; telegram: string; tiktok: string };
}

const ICONS = ['🆓', '🏘️', '🛠️', '🔎', '🕊️', '🌱'];

export const ABOUT_TEXT: Record<AboutLang, AboutText> = {
	he: {
		dir: 'rtl',
		title: 'יוצאים לחירות',
		tagline: 'מתקדמים לעולם סולידרי, אחראי וחופשי',
		logoAlt: 'לוגו יוצאים לחירות — יונה ממריאה מכפות ידיים פתוחות',
		intro: [
			'אנו תנועה חברתית ישראלית א-פוליטית הלוקחת את מושג האחריות צעד קדימה, ופועלת לקדם את החברה בישראל לחיזוק הסולידריות, האחריות והחירות!',
			'אנו קהילה שהולכת וגדלה, המגובשת סביב זכויות הפרט, ריכוז כוח כלכלי, ופיקוח וביקורת על רשויות המדינה — על מנת לקדם חזון של חיים חופשיים בהרמוניה עם כלל תושבי הארץ.',
			'הפרקטיקה שלנו מבוצעת על ידי התאגדות של שכונות בכל הארץ לגוף עממי אחד, כאשר בראש כל שכונה עומד רכז / ועד שכונתי המקדם את האינטרסים של אותה שכונה מול רשויות המדינה.',
			'הקמנו רשת פלטפורמות שכל אחת מהן פותרת בעיה ציבורית אחת ומאפשרת לנו לגבש את הכוח הציבורי כולו לטובת חזון זה. כל אחת מהפלטפורמות ממנפת את חברתה, בתקווה להתקדם לחיים סולידריים שבהם העם הוא חכם ואחראי, ויש לו שליטה על מוסדותיו!'
		],
		sitesTitle: 'אתרי הרשת',
		principlesTitle: 'העקרונות שלנו',
		principles: [
			{
				title: 'חינם, תמיד',
				text: 'כל הפלטפורמות פתוחות לשימוש ללא תשלום. הפעילות מבוססת התנדבות, והמימון מגיע מפרסום מקומי ומחנות החירות.'
			},
			{
				title: 'מקומי לפני ארצי',
				text: 'הכוח נמצא בשכונה. כל כלי ברשת נבנה כדי לחזק קודם כול את מי שגר לידך — ורק אחר כך את התמונה הארצית.'
			},
			{
				title: 'מעשי, לא הצהרתי',
				text: 'לא מחאה ולא מניפסט. כל תחום מקבל פלטפורמה עובדת שאפשר להשתמש בה כבר היום — גמ״ח, בורר, בעל מקצוע, קבוצת רכישה.'
			},
			{
				title: 'שקיפות ואחריותיות',
				text: 'פעולות עובדי הציבור מתועדות, מדורגות ונחשפות. ציבור שרואה מה נעשה בשמו הוא ציבור שאפשר לתת בו אמון.'
			},
			{
				title: 'זהות אחת לכל הרשת',
				text: 'נרשמים פעם אחת — ומזוהים בכל אתרי הרשת, בלי הרשמה חוזרת ובלי עוד סיסמה לזכור.'
			},
			{
				title: 'נבנה בידי המשתמשים',
				text: 'התוכן, הביקורת והדירוגים מגיעים מהתושבים עצמם. אנחנו מספקים את הכלים; הקהילה מספקת את התוכן.'
			}
		].map((p, i) => ({ icon: ICONS[i], ...p })),
		joinTitle: '🕊️ הרשמה אחת — נוכחות בכל הרשת',
		joinText:
			'מי שנרשם אצלנו מזוהה אוטומטית בכל אתרי יוצאים לחירות. בלי הרשמה חוזרת, בלי עוד סיסמה — ועם גישה מלאה לכל הפלטפורמות.',
		register: '✨ הרשמה',
		login: 'כבר רשומים? התחברות',
		contact: '✉️ צרו קשר',
		socials: { facebook: 'פייסבוק', youtube: 'יוטיוב', telegram: 'טלגרם', tiktok: 'טיקטוק' }
	},

	en: {
		dir: 'ltr',
		title: 'Going to Freedom',
		tagline: 'Advancing toward a solidary, responsible and free world',
		logoAlt: 'Going to Freedom logo — a dove taking flight from open hands',
		intro: [
			'We are a non-partisan Israeli social movement that takes the idea of responsibility one step further, working to move Israeli society toward greater solidarity, responsibility and freedom!',
			'We are a growing community united around individual rights, concentrated economic power, and oversight and scrutiny of state authorities — to advance a vision of free lives in harmony with all the residents of the land.',
			'Our practice is carried out by uniting neighborhoods across the country into one grassroots body, with each neighborhood led by a coordinator / neighborhood committee that advances its interests before the state authorities.',
			'We have built a network of platforms, each solving one public problem and together allowing us to unite the full power of the public behind this vision. Each platform strengthens the others, in the hope of moving toward a life of solidarity in which the people are wise and responsible, and in control of their institutions!'
		],
		sitesTitle: 'Network sites',
		principlesTitle: 'Our principles',
		principles: [
			{
				title: 'Free, always',
				text: 'All platforms are open to use at no cost. Our work is volunteer-based, funded by local advertising and the Freedom Store.'
			},
			{
				title: 'Local before national',
				text: 'The power is in the neighborhood. Every tool in the network is built first to strengthen the people who live next to you — and only then the national picture.'
			},
			{
				title: 'Practical, not declarative',
				text: 'Not a protest and not a manifesto. Every field gets a working platform you can use today — a gemach, an arbitrator, a professional, a purchasing group.'
			},
			{
				title: 'Transparency and accountability',
				text: 'The actions of public servants are documented, rated and exposed. A public that sees what is done in its name is a public that can be trusted.'
			},
			{
				title: 'One identity for the whole network',
				text: 'Sign up once — and be recognized across all network sites, with no repeat registration and no extra password to remember.'
			},
			{
				title: 'Built by its users',
				text: 'The content, reviews and ratings come from the residents themselves. We provide the tools; the community provides the content.'
			}
		].map((p, i) => ({ icon: ICONS[i], ...p })),
		joinTitle: '🕊️ One sign-up — present across the whole network',
		joinText:
			'Anyone who signs up with us is automatically recognized on every Going to Freedom site. No repeat registration, no extra password — and full access to all platforms.',
		register: '✨ Sign up',
		login: 'Already registered? Log in',
		contact: '✉️ Contact us',
		socials: { facebook: 'Facebook', youtube: 'YouTube', telegram: 'Telegram', tiktok: 'TikTok' }
	},

	ru: {
		dir: 'ltr',
		title: 'Путь к свободе',
		tagline: 'Движемся к солидарному, ответственному и свободному миру',
		logoAlt: 'Логотип «Путь к свободе» — голубь, взлетающий с раскрытых ладоней',
		intro: [
			'Мы — израильское внепартийное общественное движение, которое делает понятие ответственности шагом дальше и работает над тем, чтобы израильское общество укрепляло солидарность, ответственность и свободу!',
			'Мы — растущее сообщество, объединённое вокруг прав личности, концентрации экономической силы, а также надзора и контроля над государственными органами — ради видения свободной жизни в гармонии со всеми жителями страны.',
			'Наша практика — объединение районов по всей стране в единый народный орган, где во главе каждого района стоит координатор / районный комитет, отстаивающий интересы своего района перед государственными органами.',
			'Мы создали сеть платформ, каждая из которых решает одну общественную проблему и позволяет нам объединить всю силу общества ради этого видения. Каждая платформа усиливает другие — в надежде прийти к солидарной жизни, в которой народ мудр и ответственен и контролирует свои институты!'
		],
		sitesTitle: 'Сайты сети',
		principlesTitle: 'Наши принципы',
		principles: [
			{
				title: 'Бесплатно, всегда',
				text: 'Все платформы открыты для использования бесплатно. Работа основана на волонтёрстве, а финансирование идёт от местной рекламы и Магазина свободы.'
			},
			{
				title: 'Местное прежде общенационального',
				text: 'Сила — в районе. Каждый инструмент сети создан, чтобы прежде всего поддержать тех, кто живёт рядом с вами, — и только потом общую картину страны.'
			},
			{
				title: 'Практика, а не декларации',
				text: 'Не протест и не манифест. Каждая сфера получает работающую платформу, которой можно пользоваться уже сегодня, — гмах, третейский судья, специалист, закупочная группа.'
			},
			{
				title: 'Прозрачность и подотчётность',
				text: 'Действия государственных служащих документируются, оцениваются и становятся публичными. Общество, которое видит, что делается от его имени, — это общество, которому можно доверять.'
			},
			{
				title: 'Одна учётная запись для всей сети',
				text: 'Регистрируетесь один раз — и вас узнают на всех сайтах сети, без повторной регистрации и без лишнего пароля.'
			},
			{
				title: 'Создано пользователями',
				text: 'Контент, отзывы и рейтинги поступают от самих жителей. Мы даём инструменты; сообщество наполняет их содержанием.'
			}
		].map((p, i) => ({ icon: ICONS[i], ...p })),
		joinTitle: '🕊️ Одна регистрация — присутствие во всей сети',
		joinText:
			'Каждый, кто зарегистрировался у нас, автоматически узнаётся на всех сайтах «Путь к свободе». Без повторной регистрации, без лишнего пароля — и с полным доступом ко всем платформам.',
		register: '✨ Регистрация',
		login: 'Уже зарегистрированы? Войти',
		contact: '✉️ Связаться с нами',
		socials: { facebook: 'Facebook', youtube: 'YouTube', telegram: 'Telegram', tiktok: 'TikTok' }
	}
};

// ── רשימת הרכזים (NetworkAdmins) ──

export interface AdminsText {
	title: string;
	loading: string;
	loadError: string;
	notAssigned: string;
	msgTo: (name: string) => string;
	waTo: (name: string) => string;
	emailTo: (name: string) => string;
	waWarnTitle: string;
	waWarnText: (name: string) => string;
	leaveMessage: string;
	email: string;
	waUrgent: string;
	msgTitle: (name: string) => string;
	msgSent: (name: string) => string;
	close: string;
	loginNeeded: string;
	login: string;
	orEmail: string;
	msgLabel: string;
	msgPlaceholder: string;
	msgHint: string;
	sending: string;
	send: string;
	cancel: string;
	sendFailed: string;
	/** שמות האתרים לפי id; חסר = השם העברי מ-sitesData */
	siteNames: Record<string, string>;
}

export const ADMINS_TEXT: Record<AboutLang, AdminsText> = {
	he: {
		title: 'צוות הרכזים',
		loading: 'טוען…',
		loadError: 'לא הצלחנו לטעון את בעלי התפקידים ברשת. נסו לרענן את הדף.',
		notAssigned: 'טרם מונה',
		msgTo: (n) => `השאירו הודעה ל${n}`,
		waTo: (n) => `וואטסאפ ל${n} (דחוף בלבד)`,
		emailTo: (n) => `אימייל ל${n}`,
		waWarnTitle: '⚠️ וואטסאפ — למקרים דחופים בלבד',
		waWarnText: (n) =>
			`פנייה בוואטסאפ ל${n} נועדה למקרים דחופים בלבד. בכל נושא אחר — נא להשאיר הודעה או לפנות במייל, והרכז יחזור אליכם.`,
		leaveMessage: '✉️ השארת הודעה',
		email: '📧 מייל',
		waUrgent: '💬 זה דחוף — לוואטסאפ',
		msgTitle: (n) => `✉️ הודעה ל${n}`,
		msgSent: (n) =>
			`ההודעה נשלחה ✓ היא ממתינה בתיבה האישית של ${n} בקהילה בשכונה, ונשלחה עליה התראה לנייד. התשובה תגיע אליכם למייל.`,
		close: 'סגירה',
		loginNeeded: 'כדי להשאיר הודעה צריך להתחבר — כך הרכז יודע ממי ההודעה ולאן להשיב.',
		login: '🕊️ התחברות',
		orEmail: '📧 או במייל',
		msgLabel: 'תוכן ההודעה',
		msgPlaceholder: 'במה אפשר לעזור?',
		msgHint: 'ההודעה תגיע לתיבה האישית של הרכז בקהילה בשכונה, ותישלח אליו התראה ב-SMS.',
		sending: 'שולח…',
		send: 'שליחה',
		cancel: 'ביטול',
		sendFailed: 'שליחת ההודעה נכשלה — נסו שוב',
		siteNames: {}
	},

	en: {
		title: 'Coordinators team',
		loading: 'Loading…',
		loadError: "We couldn't load the network's coordinators. Please try refreshing the page.",
		notAssigned: 'Not yet assigned',
		msgTo: (n) => `Leave a message for ${n}`,
		waTo: (n) => `WhatsApp ${n} (urgent only)`,
		emailTo: (n) => `Email ${n}`,
		waWarnTitle: '⚠️ WhatsApp — urgent matters only',
		waWarnText: (n) =>
			`WhatsApp messages to ${n} are for urgent matters only. For anything else, please leave a message or send an email, and the coordinator will get back to you.`,
		leaveMessage: '✉️ Leave a message',
		email: '📧 Email',
		waUrgent: "💬 It's urgent — go to WhatsApp",
		msgTitle: (n) => `✉️ Message to ${n}`,
		msgSent: (n) =>
			`Message sent ✓ It is waiting in ${n}'s personal inbox on Community in the Neighborhood, and a notification was sent to their phone. The reply will reach you by email.`,
		close: 'Close',
		loginNeeded: 'You need to log in to leave a message — so the coordinator knows who it is from and where to reply.',
		login: '🕊️ Log in',
		orEmail: '📧 Or by email',
		msgLabel: 'Message',
		msgPlaceholder: 'How can we help?',
		msgHint:
			"The message will reach the coordinator's personal inbox on Community in the Neighborhood, with an SMS notification.",
		sending: 'Sending…',
		send: 'Send',
		cancel: 'Cancel',
		sendFailed: 'Sending the message failed — please try again',
		siteNames: {
			portal: 'Going to Freedom',
			community_neighborhood: 'Community in the Neighborhood',
			courts_reconciliation: 'Courts & Reconciliation',
			national_gemach: 'National Gemach',
			lost_and_found: 'Lost & Found',
			neighborhood_committees: 'Neighborhood Committees',
			state_auditor: 'State Authorities Auditor',
			public_rating: 'Public Rating',
			experts: 'The Experts',
			referendum: 'Referendums',
			purchasing_group: 'Group Purchasing',
			professionals: 'Our Professionals',
			freedom_store: 'Freedom Store'
		}
	},

	ru: {
		title: 'Команда координаторов',
		loading: 'Загрузка…',
		loadError: 'Не удалось загрузить координаторов сети. Попробуйте обновить страницу.',
		notAssigned: 'Пока не назначен',
		msgTo: (n) => `Оставить сообщение: ${n}`,
		waTo: (n) => `WhatsApp: ${n} (только срочно)`,
		emailTo: (n) => `Email: ${n}`,
		waWarnTitle: '⚠️ WhatsApp — только для срочных случаев',
		waWarnText: (n) =>
			`Обращение в WhatsApp к ${n} предназначено только для срочных случаев. По любому другому вопросу оставьте сообщение или напишите на почту — координатор вам ответит.`,
		leaveMessage: '✉️ Оставить сообщение',
		email: '📧 Почта',
		waUrgent: '💬 Это срочно — в WhatsApp',
		msgTitle: (n) => `✉️ Сообщение: ${n}`,
		msgSent: (n) =>
			`Сообщение отправлено ✓ Оно ждёт в личном ящике (${n}) на сайте «Сообщество в районе», а на телефон отправлено уведомление. Ответ придёт вам на почту.`,
		close: 'Закрыть',
		loginNeeded: 'Чтобы оставить сообщение, нужно войти — так координатор знает, от кого сообщение и куда ответить.',
		login: '🕊️ Войти',
		orEmail: '📧 Или по почте',
		msgLabel: 'Текст сообщения',
		msgPlaceholder: 'Чем мы можем помочь?',
		msgHint: 'Сообщение попадёт в личный ящик координатора на сайте «Сообщество в районе», и ему придёт SMS-уведомление.',
		sending: 'Отправка…',
		send: 'Отправить',
		cancel: 'Отмена',
		sendFailed: 'Не удалось отправить сообщение — попробуйте ещё раз',
		siteNames: {
			portal: 'Путь к свободе',
			community_neighborhood: 'Сообщество в районе',
			courts_reconciliation: 'Суды и примирение',
			national_gemach: 'Национальный гмах',
			lost_and_found: 'Бюро находок',
			neighborhood_committees: 'Районные комитеты',
			state_auditor: 'Аудитор государственных органов',
			public_rating: 'Народный рейтинг',
			experts: 'Эксперты',
			referendum: 'Народные референдумы',
			purchasing_group: 'Групповые закупки',
			professionals: 'Наши специалисты',
			freedom_store: 'Магазин свободы'
		}
	}
};
