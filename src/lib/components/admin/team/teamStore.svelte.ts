// ============================================================
// המצב של לוח הצוות בדפדפן: הנתונים, תור הפעולות מול השרת, רענון ומעקב "חדש".
//
// כל פעולה מוחלת מיד על הלוח המקומי (applyOp — אותו קוד שהשרת מריץ), ונשלחת
// לשרת בתור לפי הסדר. כשהתור מתרוקן — הלוח מתחלף בגרסת השרת (שכוללת גם שינויים
// של אחרים). כשל = הודעה + טעינה מחדש, כך שהמסך לעולם לא נשאר עם שינוי שלא נשמר.
// ============================================================
import {
	applyOp,
	emptyBoard,
	normalizeBoard,
	BoardError,
	type Actor,
	type BoardData,
	type BoardOp,
	type BoardTask,
	type Member
} from '$lib/teamBoard';

const POLL_MS = 30_000;

interface Seen {
	/** הביקור הראשון — כל מה שקדם לו לא מסומן כחדש */
	base: string;
	/** משימה → מתי נפתחה לאחרונה */
	t: Record<string, string>;
	/** מתי נפתחה לשונית הדיווחים לאחרונה */
	r: string;
}

export class TeamStore {
	board = $state<BoardData>(emptyBoard());
	me = $state<Actor | null>(null);
	team = $state<Member[]>([]);
	loaded = $state(false);
	loadError = $state('');
	toast = $state<{ type: 'ok' | 'err'; msg: string } | null>(null);
	saving = $state(false);
	seen = $state<Seen>({ base: '', t: {}, r: '' });
	/** סינון לוח המשימות — כאן ולא ברכיב, כדי שגם סקירת הצוות תוכל לכוון אליו */
	filter = $state({
		scope: 'all' as 'all' | 'mine' | 'created' | 'overdue',
		assignee: '',
		site: '',
		q: ''
	});

	#pending = 0;
	#chain: Promise<void> = Promise.resolve();
	#toastTimer: ReturnType<typeof setTimeout> | undefined;
	#poll: ReturnType<typeof setInterval> | undefined;

	/** חבר צוות לפי מזהה, כולל מי שכבר לא ברשימת הרכזים */
	member(id: string): Member {
		const m = this.team.find((x) => x.id === id);
		if (m) return m;
		const p = this.board.people[id];
		const siteMatch = /^site:/.test(id);
		return {
			id,
			email: siteMatch ? '' : id,
			name: p?.name || (siteMatch ? 'רכז/ת' : id.split('@')[0]),
			role: '',
			phone: '',
			avatar: p?.image ?? '',
			siteIds: [],
			isSuper: false
		};
	}

	async load(silent = false): Promise<void> {
		try {
			const res = await fetch('/api/team-board', { cache: 'no-store' });
			const json = (await res.json().catch(() => ({}))) as {
				error?: string;
				me?: Actor;
				team?: Member[];
				board?: unknown;
			};
			if (!res.ok) throw new Error(json.error || 'שגיאה בטעינת הלוח');
			// פעולה שנשלחה בינתיים — גרסת השרת כאן כבר לא עדכנית; התשובה שלה תביא את הנכונה
			if (this.#pending > 0) return;
			this.me = json.me ?? null;
			this.team = json.team ?? [];
			this.board = normalizeBoard(json.board);
			this.loadError = '';
			if (!this.loaded) this.#initSeen();
			this.loaded = true;
		} catch (e) {
			if (!silent || !this.loaded) this.loadError = e instanceof Error ? e.message : 'שגיאה בטעינת הלוח';
		}
	}

	/** רענון תקופתי כשהלשונית גלויה — כך רואים שינויים של שאר הצוות בלי לרענן */
	startPolling(): () => void {
		const tick = () => {
			if (document.visibilityState === 'visible' && this.#pending === 0) this.load(true);
		};
		this.#poll = setInterval(tick, POLL_MS);
		document.addEventListener('visibilitychange', tick);
		return () => {
			clearInterval(this.#poll);
			document.removeEventListener('visibilitychange', tick);
		};
	}

	/** מחיל פעולה מיד ושולח לשרת. מחזיר false אם הפעולה נדחתה מקומית. */
	run(op: BoardOp, okMsg = ''): boolean {
		if (!this.me) return false;
		try {
			applyOp(this.board, op, this.me, new Date().toISOString());
		} catch (e) {
			this.flash('err', e instanceof BoardError ? e.message : 'הפעולה נכשלה');
			// פעולה שנכשלה באמצע יכלה להשאיר שינוי חלקי על המסך — מסנכרנים מהשרת
			if (this.#pending === 0) this.load(true);
			return false;
		}
		this.#pending++;
		this.saving = true;
		this.#chain = this.#chain.then(async () => {
			let fresh: BoardData | null = null;
			let failed = false;
			try {
				const res = await fetch('/api/team-board', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ op })
				});
				const json = (await res.json().catch(() => ({}))) as { error?: string; board?: unknown };
				if (!res.ok) throw new Error(json.error || 'השמירה נכשלה — נסו שוב');
				fresh = normalizeBoard(json.board);
			} catch (e) {
				failed = true;
				this.flash('err', e instanceof Error ? e.message : 'השמירה נכשלה — נסו שוב');
			}
			this.#pending--;
			if (this.#pending === 0) {
				this.saving = false;
				if (failed) await this.load(true);
				else if (fresh) this.board = fresh;
			}
			if (!failed && okMsg) this.flash('ok', okMsg);
		});
		return true;
	}

	flash(type: 'ok' | 'err', msg: string) {
		clearTimeout(this.#toastTimer);
		this.toast = { type, msg };
		this.#toastTimer = setTimeout(() => (this.toast = null), type === 'ok' ? 2200 : 5000);
	}

	// ── מעקב "חדש בשבילך" (בדפדפן הזה בלבד) ──

	#seenKey() {
		return `teamboard:seen:${this.me?.id ?? ''}`;
	}

	#initSeen() {
		const now = new Date().toISOString();
		try {
			const raw = JSON.parse(localStorage.getItem(this.#seenKey()) ?? 'null');
			if (raw && typeof raw.base === 'string') {
				this.seen = { base: raw.base, t: raw.t ?? {}, r: raw.r ?? raw.base };
				return;
			}
		} catch {}
		this.seen = { base: now, t: {}, r: now };
		this.#saveSeen();
	}

	#saveSeen() {
		try {
			// רק משימות שעדיין קיימות — שהרשומה לא תגדל לנצח
			const ids = new Set(this.board.tasks.map((t) => t.id));
			const t = Object.fromEntries(Object.entries(this.seen.t).filter(([id]) => ids.has(id)));
			localStorage.setItem(this.#seenKey(), JSON.stringify({ ...this.seen, t }));
		} catch {}
	}

	markTaskSeen(id: string) {
		this.seen.t[id] = new Date().toISOString();
		this.#saveSeen();
	}

	markReportsSeen() {
		this.seen.r = new Date().toISOString();
		this.#saveSeen();
	}

	/** מתי מישהו אחר נגע לאחרונה במשימה (יצירה, תגובה, שינוי) */
	lastOthersActivity(task: BoardTask): string {
		const me = this.me?.id;
		let last = task.createdBy !== me ? task.createdAt : '';
		for (const e of task.entries) if (e.by !== me && e.at > last) last = e.at;
		return last;
	}

	isTaskUnread(task: BoardTask): boolean {
		const last = this.lastOthersActivity(task);
		return !!last && last > (this.seen.t[task.id] ?? this.seen.base);
	}
}
