// ============================================================
// לוח הצוות של "ניהול הרשת" (/admin) — מודל הנתונים והפעולות.
//
// אותו קוד רץ בשני הצדדים: בשרת הוא הסמכות (מוודא הרשאות ומחיל את הפעולה על
// הלוח השמור ב-Strapi המשותף), ובדפדפן הוא מחיל את הפעולה מיד — כך גרירה,
// סימון וי או תגובה מופיעים על המסך בלי להמתין לשרת, ותשובת השרת רק מאשרת.
// המזהים נוצרים בדפדפן, ולכן הפריט שעל המסך והפריט השמור זהים.
//
// הלוח כולו הוא מסמך JSON אחד (ראו lib/server/teamBoard.ts); חבר צוות מזוהה
// באימייל שלו, ורכז בלי אימייל — במזהה "site:<siteId>" (אפשר לשייך לו משימות
// ולשלוח לו אותן בוואטסאפ, גם אם הוא עוד לא נכנס לפאנל).
// ============================================================

export const STATUSES = [
	{ id: 'todo', label: 'לביצוע', icon: '📝' },
	{ id: 'doing', label: 'בעבודה', icon: '⚙️' },
	{ id: 'review', label: 'ממתין לאישור', icon: '👀' },
	{ id: 'done', label: 'הושלם', icon: '✅' }
] as const;
export type TaskStatus = (typeof STATUSES)[number]['id'];

export const PRIORITIES = [
	{ id: 'urgent', label: 'דחוף', icon: '🔴', cls: 'border-red-500/40 bg-red-500/15 text-red-200' },
	{ id: 'high', label: 'גבוהה', icon: '🟠', cls: 'border-orange-400/40 bg-orange-400/10 text-orange-200' },
	{ id: 'normal', label: 'רגילה', icon: '🔵', cls: 'border-sky-400/30 bg-sky-400/10 text-sky-200' },
	{ id: 'low', label: 'נמוכה', icon: '⚪', cls: 'border-white/15 bg-white/5 text-gray-300' }
] as const;
export type TaskPriority = (typeof PRIORITIES)[number]['id'];

/** סוגי הפעולות לקידום התנועה שהצוות מדווח עליהן */
export const REPORT_CATEGORIES = [
	{ id: 'outreach', label: 'הסברה ותוכן', icon: '📣' },
	{ id: 'recruit', label: 'גיוס ושיתופי פעולה', icon: '🤝' },
	{ id: 'community', label: 'קהילה ואירועים', icon: '🎪' },
	{ id: 'site', label: 'פיתוח ותפעול האתר', icon: '🛠️' },
	{ id: 'support', label: 'מענה לגולשים', icon: '💬' },
	{ id: 'other', label: 'אחר', icon: '✨' }
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['id'];

export const REACTIONS = ['👏', '🔥', '❤️', '💡', '🙏'] as const;

// ── מבנה הנתונים ──

/** תגובה בשרשור של משימה, או רישום אוטומטי ביומן הפעילות שלה */
export type TaskEntry =
	| { id: string; by: string; at: string; kind: 'comment'; text: string }
	| {
			id: string;
			by: string;
			at: string;
			kind: 'event';
			event: 'created' | 'status' | 'assign' | 'due' | 'priority';
			value: string;
	  };

export interface ChecklistItem {
	id: string;
	text: string;
	done: boolean;
}

export interface BoardTask {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	/** מזהי חברי הצוות האחראים (אימייל או site:<siteId>) */
	assignees: string[];
	/** האתר שהמשימה שייכת לו; ריק = כלל הרשת */
	siteId: string;
	/** תאריך יעד YYYY-MM-DD, או ריק */
	due: string;
	checklist: ChecklistItem[];
	entries: TaskEntry[];
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	completedAt: string;
	/** מיקום בתוך העמודה (קטן = למעלה) */
	order: number;
}

export interface ReportReply {
	id: string;
	by: string;
	at: string;
	text: string;
}

/** דיווח פעילות: מה חבר צוות עשה לקידום התנועה */
export interface BoardReport {
	id: string;
	by: string;
	at: string;
	category: ReportCategory;
	text: string;
	link: string;
	/** כמה אנשים נחשפו / השתתפו (לא חובה; 0 = לא צוין) */
	reach: number;
	/** משימה קשורה (לא חובה) */
	taskId: string;
	/** אימוג'י → מזהי מי שהגיבו בו */
	reactions: Record<string, string[]>;
	replies: ReportReply[];
}

export interface BoardData {
	v: 1;
	tasks: BoardTask[];
	reports: BoardReport[];
	/** שם ותמונה אחרונים של כל מי שפעל בלוח — לתצוגה של מי שאינו ברשימת הרכזים */
	people: Record<string, { name: string; image: string }>;
}

/** מי שמבצע את הפעולה */
export interface Actor {
	id: string;
	name: string;
	image: string;
	isSuper: boolean;
}

/** חבר צוות ברשימה (נגזר ממינויי הרכזים + הסופר-אדמינים) */
export interface Member {
	id: string;
	email: string;
	name: string;
	role: string;
	phone: string;
	avatar: string;
	siteIds: string[];
	isSuper: boolean;
}

export type TaskPatch = Partial<
	Pick<BoardTask, 'title' | 'description' | 'priority' | 'assignees' | 'siteId' | 'due' | 'status'>
>;

export type BoardOp =
	| {
			type: 'task.create';
			id: string;
			title: string;
			description?: string;
			status?: TaskStatus;
			priority?: TaskPriority;
			assignees?: string[];
			siteId?: string;
			due?: string;
	  }
	| { type: 'task.update'; id: string; patch: TaskPatch }
	| { type: 'task.move'; id: string; status: TaskStatus; beforeId: string | null }
	| { type: 'task.delete'; id: string }
	| { type: 'check.add'; taskId: string; id: string; text: string }
	| { type: 'check.toggle'; taskId: string; id: string }
	| { type: 'check.remove'; taskId: string; id: string }
	| { type: 'comment.add'; taskId: string; id: string; text: string }
	| { type: 'comment.remove'; taskId: string; id: string }
	| {
			type: 'report.add';
			id: string;
			category: ReportCategory;
			text: string;
			link?: string;
			reach?: number;
			taskId?: string;
	  }
	| { type: 'report.remove'; id: string }
	| { type: 'report.react'; id: string; emoji: string }
	| { type: 'report.reply'; reportId: string; id: string; text: string }
	| { type: 'report.replyRemove'; reportId: string; id: string };

// ── מגבלות — שהמסמך לא יתנפח ──
export const LIMITS = {
	title: 200,
	description: 5000,
	comment: 2000,
	checkItem: 300,
	report: 3000,
	link: 500,
	tasks: 2000,
	entriesPerTask: 400,
	checklist: 60,
	reports: 1500,
	repliesPerReport: 200,
	assignees: 12
} as const;

export class BoardError extends Error {
	constructor(
		message: string,
		public status = 400
	) {
		super(message);
	}
}

// ── עזרים ──

export function newId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function emptyBoard(): BoardData {
	return { v: 1, tasks: [], reports: [], people: {} };
}

const STATUS_IDS = new Set<string>(STATUSES.map((s) => s.id));
const PRIORITY_IDS = new Set<string>(PRIORITIES.map((p) => p.id));
const CATEGORY_IDS = new Set<string>(REPORT_CATEGORIES.map((c) => c.id));
const REACTION_SET = new Set<string>(REACTIONS);

export const statusOf = (id: string) => STATUSES.find((s) => s.id === id) ?? STATUSES[0];
export const priorityOf = (id: string) => PRIORITIES.find((p) => p.id === id) ?? PRIORITIES[2];
export const categoryOf = (id: string) =>
	REPORT_CATEGORIES.find((c) => c.id === id) ?? REPORT_CATEGORIES[REPORT_CATEGORIES.length - 1];

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const s = (v: unknown): string => (typeof v === 'string' ? v : '');

/** מסדר מסמך שהגיע מהשרת (או null) למבנה תקין — עמיד לשדות חסרים */
export function normalizeBoard(raw: unknown): BoardData {
	const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
	const tasks = arr<Record<string, unknown>>(r.tasks).map(
		(t): BoardTask => ({
			id: s(t.id),
			title: s(t.title),
			description: s(t.description),
			status: (STATUS_IDS.has(s(t.status)) ? t.status : 'todo') as TaskStatus,
			priority: (PRIORITY_IDS.has(s(t.priority)) ? t.priority : 'normal') as TaskPriority,
			assignees: arr<string>(t.assignees).filter((a) => typeof a === 'string'),
			siteId: s(t.siteId),
			due: s(t.due),
			checklist: arr<ChecklistItem>(t.checklist).map((c) => ({
				id: s(c.id),
				text: s(c.text),
				done: !!c.done
			})),
			entries: arr<TaskEntry>(t.entries).filter((e) => e && typeof e === 'object' && e.id),
			createdBy: s(t.createdBy),
			createdAt: s(t.createdAt),
			updatedAt: s(t.updatedAt) || s(t.createdAt),
			completedAt: s(t.completedAt),
			order: typeof t.order === 'number' && Number.isFinite(t.order) ? t.order : 0
		})
	);
	const reports = arr<Record<string, unknown>>(r.reports).map(
		(p): BoardReport => ({
			id: s(p.id),
			by: s(p.by),
			at: s(p.at),
			category: (CATEGORY_IDS.has(s(p.category)) ? p.category : 'other') as ReportCategory,
			text: s(p.text),
			link: s(p.link),
			reach: typeof p.reach === 'number' && p.reach > 0 ? Math.floor(p.reach) : 0,
			taskId: s(p.taskId),
			reactions:
				p.reactions && typeof p.reactions === 'object'
					? Object.fromEntries(
							Object.entries(p.reactions as Record<string, unknown>).map(([k, v]) => [
								k,
								arr<string>(v)
							])
						)
					: {},
			replies: arr<ReportReply>(p.replies).filter((x) => x && typeof x === 'object' && x.id)
		})
	);
	const people: BoardData['people'] = {};
	if (r.people && typeof r.people === 'object') {
		for (const [k, v] of Object.entries(r.people as Record<string, { name?: unknown; image?: unknown }>)) {
			people[k] = { name: s(v?.name), image: s(v?.image) };
		}
	}
	return { v: 1, tasks: tasks.filter((t) => t.id), reports: reports.filter((p) => p.id), people };
}

// ── הרשאות ──

/** עריכת משימה: סופר-אדמין, מי שפתח אותה ומי שאחראי עליה */
export function canEditTask(task: BoardTask, actor: Pick<Actor, 'id' | 'isSuper'>): boolean {
	return actor.isSuper || task.createdBy === actor.id || task.assignees.includes(actor.id);
}

/** מחיקת משימה: סופר-אדמין ומי שפתח אותה */
export function canDeleteTask(task: BoardTask, actor: Pick<Actor, 'id' | 'isSuper'>): boolean {
	return actor.isSuper || task.createdBy === actor.id;
}

// ── אימות קלט (הפעולה מגיעה לשרת מהדפדפן — לא סומכים על שום שדה) ──

const ID_RE = /^[a-z0-9-]{8,64}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MEMBER_RE = /^(site:[a-z0-9_]{1,60}|[^\s@]+@[^\s@]+\.[^\s@]+)$/i;

function vid(v: unknown): string {
	if (typeof v !== 'string' || !ID_RE.test(v)) throw new BoardError('מזהה לא תקין');
	return v;
}

function vtext(v: unknown, max: number, what: string, required = true): string {
	const t = typeof v === 'string' ? v.trim() : '';
	if (required && !t) throw new BoardError(`חסר ${what}`);
	if (t.length > max) throw new BoardError(`${what} ארוך מדי`);
	return t;
}

function vdate(v: unknown): string {
	const d = typeof v === 'string' ? v.trim() : '';
	if (d && !DATE_RE.test(d)) throw new BoardError('תאריך לא תקין');
	return d;
}

function vassignees(v: unknown): string[] {
	const list = arr<unknown>(v)
		.filter((a): a is string => typeof a === 'string' && MEMBER_RE.test(a.trim()))
		.map((a) => a.trim().toLowerCase());
	return [...new Set(list)].slice(0, LIMITS.assignees);
}

function vlink(v: unknown): string {
	const l = vtext(v, LIMITS.link, 'קישור', false);
	if (l && !/^https?:\/\//i.test(l)) throw new BoardError('הקישור צריך להתחיל ב-http');
	return l;
}

function findTask(board: BoardData, id: unknown): BoardTask {
	const t = board.tasks.find((x) => x.id === id);
	if (!t) throw new BoardError('המשימה לא נמצאה (אולי נמחקה)', 404);
	return t;
}

function findReport(board: BoardData, id: unknown): BoardReport {
	const r = board.reports.find((x) => x.id === id);
	if (!r) throw new BoardError('הדיווח לא נמצא (אולי נמחק)', 404);
	return r;
}

function requireEdit(task: BoardTask, actor: Actor) {
	if (!canEditTask(task, actor))
		throw new BoardError('רק מי שפתח את המשימה, האחראים עליה ומנהל הרשת יכולים לשנות אותה', 403);
}

/**
 * רישום ביומן הפעילות. שינוי חוזר מאותו סוג, מאותו אדם, בתוך שתי דקות — מחליף
 * את הרישום הקודם במקום להוסיף (גרירה הלוך-חזור לא מציפה את היומן).
 */
function logEvent(
	task: BoardTask,
	actor: Actor,
	now: string,
	event: Extract<TaskEntry, { kind: 'event' }>['event'],
	value: string
) {
	const last = task.entries[task.entries.length - 1];
	if (
		last?.kind === 'event' &&
		last.event === event &&
		last.by === actor.id &&
		Date.parse(now) - Date.parse(last.at) < 120_000
	) {
		last.value = value;
		last.at = now;
		return;
	}
	task.entries.push({ id: newId(), by: actor.id, at: now, kind: 'event', event, value });
	trimEntries(task);
}

/** שומר על תקרת רשומות למשימה — קודם נזרקים רישומי יומן ישנים, תגובות רק אם אין ברירה */
function trimEntries(task: BoardTask) {
	while (task.entries.length > LIMITS.entriesPerTask) {
		const i = task.entries.findIndex((e) => e.kind === 'event');
		task.entries.splice(i >= 0 ? i : 0, 1);
	}
}

function columnOf(board: BoardData, status: TaskStatus, exceptId = ''): BoardTask[] {
	return board.tasks
		.filter((t) => t.status === status && t.id !== exceptId)
		.sort((a, b) => a.order - b.order);
}

/** מיקום בראש העמודה */
function topOrder(board: BoardData, status: TaskStatus): number {
	const col = columnOf(board, status);
	return col.length ? col[0].order - 1 : 0;
}

function setStatus(task: BoardTask, status: TaskStatus, actor: Actor, now: string) {
	if (task.status === status) return;
	task.status = status;
	task.completedAt = status === 'done' ? now : '';
	logEvent(task, actor, now, 'status', status);
}

/**
 * מחיל פעולה על הלוח (משנה אותו במקום). זורק BoardError כשהפעולה לא חוקית או
 * שאין הרשאה — ואז הלוח לא השתנה.
 */
export function applyOp(board: BoardData, op: BoardOp, actor: Actor, now: string): void {
	if (!op || typeof op !== 'object') throw new BoardError('פעולה לא תקינה');

	switch (op.type) {
		case 'task.create': {
			const id = vid(op.id);
			if (board.tasks.some((t) => t.id === id)) return; // נשלח פעמיים — כבר קיים
			const status = STATUS_IDS.has(op.status ?? '') ? (op.status as TaskStatus) : 'todo';
			const task: BoardTask = {
				id,
				title: vtext(op.title, LIMITS.title, 'כותרת'),
				description: vtext(op.description, LIMITS.description, 'תיאור', false),
				status,
				priority: PRIORITY_IDS.has(op.priority ?? '') ? (op.priority as TaskPriority) : 'normal',
				assignees: vassignees(op.assignees),
				siteId: vtext(op.siteId, 60, 'אתר', false),
				due: vdate(op.due),
				checklist: [],
				entries: [{ id: newId(), by: actor.id, at: now, kind: 'event', event: 'created', value: '' }],
				createdBy: actor.id,
				createdAt: now,
				updatedAt: now,
				completedAt: status === 'done' ? now : '',
				order: topOrder(board, status)
			};
			board.tasks.push(task);
			// תקרה: מפנים את המשימות שהושלמו הכי מזמן
			if (board.tasks.length > LIMITS.tasks) {
				const oldestDone = board.tasks
					.filter((t) => t.status === 'done')
					.sort((a, b) => a.completedAt.localeCompare(b.completedAt))[0];
				if (!oldestDone) throw new BoardError('הלוח מלא — סגרו משימות ישנות');
				board.tasks.splice(board.tasks.indexOf(oldestDone), 1);
			}
			break;
		}

		case 'task.update': {
			const task = findTask(board, op.id);
			requireEdit(task, actor);
			const p = (op.patch ?? {}) as TaskPatch;
			if (p.title !== undefined) task.title = vtext(p.title, LIMITS.title, 'כותרת');
			if (p.description !== undefined)
				task.description = vtext(p.description, LIMITS.description, 'תיאור', false);
			if (p.siteId !== undefined) task.siteId = vtext(p.siteId, 60, 'אתר', false);
			if (p.priority !== undefined && PRIORITY_IDS.has(p.priority) && p.priority !== task.priority) {
				task.priority = p.priority;
				logEvent(task, actor, now, 'priority', p.priority);
			}
			if (p.due !== undefined) {
				const due = vdate(p.due);
				if (due !== task.due) {
					task.due = due;
					logEvent(task, actor, now, 'due', due);
				}
			}
			if (p.assignees !== undefined) {
				const next = vassignees(p.assignees);
				if (next.join() !== task.assignees.join()) {
					task.assignees = next;
					logEvent(task, actor, now, 'assign', next.join(','));
				}
			}
			if (p.status !== undefined && STATUS_IDS.has(p.status) && p.status !== task.status) {
				// המיקום נמדד לפני המעבר, כשהמשימה עוד לא בעמודת היעד
				const order = topOrder(board, p.status);
				setStatus(task, p.status, actor, now);
				task.order = order;
			}
			task.updatedAt = now;
			break;
		}

		case 'task.move': {
			const task = findTask(board, op.id);
			requireEdit(task, actor);
			if (!STATUS_IDS.has(op.status)) throw new BoardError('סטטוס לא תקין');
			const col = columnOf(board, op.status, task.id);
			const i = op.beforeId ? col.findIndex((t) => t.id === op.beforeId) : -1;
			if (i === -1) {
				task.order = col.length ? col[col.length - 1].order + 1 : 0;
			} else {
				const prev = i > 0 ? col[i - 1].order : col[i].order - 2;
				task.order = (prev + col[i].order) / 2;
				// הפערים הצטמצמו מאוד — ממספרים את העמודה מחדש
				if (Math.abs(col[i].order - prev) < 1e-6) {
					col.splice(i, 0, task);
					col.forEach((t, k) => (t.order = k));
				}
			}
			setStatus(task, op.status, actor, now);
			task.updatedAt = now;
			break;
		}

		case 'task.delete': {
			const task = findTask(board, op.id);
			if (!canDeleteTask(task, actor))
				throw new BoardError('רק מי שפתח את המשימה ומנהל הרשת יכולים למחוק אותה', 403);
			board.tasks.splice(board.tasks.indexOf(task), 1);
			for (const r of board.reports) if (r.taskId === task.id) r.taskId = '';
			break;
		}

		case 'check.add': {
			const task = findTask(board, op.taskId);
			requireEdit(task, actor);
			const id = vid(op.id);
			if (task.checklist.some((c) => c.id === id)) return;
			if (task.checklist.length >= LIMITS.checklist) throw new BoardError('רשימת התיוג מלאה');
			task.checklist.push({ id, text: vtext(op.text, LIMITS.checkItem, 'טקסט'), done: false });
			task.updatedAt = now;
			break;
		}

		case 'check.toggle': {
			const task = findTask(board, op.taskId);
			requireEdit(task, actor);
			const item = task.checklist.find((c) => c.id === op.id);
			if (!item) throw new BoardError('הפריט לא נמצא', 404);
			item.done = !item.done;
			task.updatedAt = now;
			break;
		}

		case 'check.remove': {
			const task = findTask(board, op.taskId);
			requireEdit(task, actor);
			task.checklist = task.checklist.filter((c) => c.id !== op.id);
			task.updatedAt = now;
			break;
		}

		case 'comment.add': {
			// כל חבר צוות יכול להגיב על כל משימה — זה ערוץ הפידבק
			const task = findTask(board, op.taskId);
			const id = vid(op.id);
			if (task.entries.some((e) => e.id === id)) return;
			task.entries.push({
				id,
				by: actor.id,
				at: now,
				kind: 'comment',
				text: vtext(op.text, LIMITS.comment, 'תגובה')
			});
			trimEntries(task);
			task.updatedAt = now;
			break;
		}

		case 'comment.remove': {
			const task = findTask(board, op.taskId);
			const entry = task.entries.find((e) => e.id === op.id);
			if (!entry || entry.kind !== 'comment') return;
			if (entry.by !== actor.id && !actor.isSuper)
				throw new BoardError('אפשר למחוק רק תגובה שכתבת', 403);
			task.entries.splice(task.entries.indexOf(entry), 1);
			break;
		}

		case 'report.add': {
			const id = vid(op.id);
			if (board.reports.some((r) => r.id === id)) return;
			const taskId = typeof op.taskId === 'string' && ID_RE.test(op.taskId) ? op.taskId : '';
			const reach = Number(op.reach ?? 0);
			board.reports.push({
				id,
				by: actor.id,
				at: now,
				category: CATEGORY_IDS.has(op.category) ? op.category : 'other',
				text: vtext(op.text, LIMITS.report, 'תיאור הפעולה'),
				link: vlink(op.link),
				reach: Number.isFinite(reach) && reach > 0 ? Math.min(Math.floor(reach), 100_000_000) : 0,
				taskId: taskId && board.tasks.some((t) => t.id === taskId) ? taskId : '',
				reactions: {},
				replies: []
			});
			if (board.reports.length > LIMITS.reports) {
				board.reports.sort((a, b) => a.at.localeCompare(b.at));
				board.reports.splice(0, board.reports.length - LIMITS.reports);
			}
			break;
		}

		case 'report.remove': {
			const report = findReport(board, op.id);
			if (report.by !== actor.id && !actor.isSuper)
				throw new BoardError('אפשר למחוק רק דיווח שכתבת', 403);
			board.reports.splice(board.reports.indexOf(report), 1);
			break;
		}

		case 'report.react': {
			const report = findReport(board, op.id);
			if (!REACTION_SET.has(op.emoji)) throw new BoardError('תגובה לא נתמכת');
			const list = report.reactions[op.emoji] ?? [];
			report.reactions[op.emoji] = list.includes(actor.id)
				? list.filter((x) => x !== actor.id)
				: [...list, actor.id];
			if (!report.reactions[op.emoji].length) delete report.reactions[op.emoji];
			break;
		}

		case 'report.reply': {
			const report = findReport(board, op.reportId);
			const id = vid(op.id);
			if (report.replies.some((x) => x.id === id)) return;
			if (report.replies.length >= LIMITS.repliesPerReport) throw new BoardError('השרשור מלא');
			report.replies.push({ id, by: actor.id, at: now, text: vtext(op.text, LIMITS.comment, 'תגובה') });
			break;
		}

		case 'report.replyRemove': {
			const report = findReport(board, op.reportId);
			const reply = report.replies.find((x) => x.id === op.id);
			if (!reply) return;
			if (reply.by !== actor.id && !actor.isSuper)
				throw new BoardError('אפשר למחוק רק תגובה שכתבת', 403);
			report.replies.splice(report.replies.indexOf(reply), 1);
			break;
		}

		default:
			throw new BoardError('פעולה לא מוכרת');
	}

	// שם ותמונה עדכניים של מי שפעל — לתצוגה גם כשאינו ברשימת הרכזים
	if (actor.name) board.people[actor.id] = { name: actor.name, image: actor.image };
}

// ── עזרי תצוגה (משותפים לרכיבי הלוח) ──

/** האם המשימה עברה את תאריך היעד (לא כולל משימות שהושלמו) */
export function isOverdue(task: BoardTask, today = todayStr()): boolean {
	return !!task.due && task.status !== 'done' && task.due < today;
}

/** התאריך של היום בשעון ישראל, YYYY-MM-DD */
export function todayStr(d = new Date()): string {
	return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
}

/** "לפני 5 דק׳" / "אתמול" / "12.3" */
export function timeAgo(iso: string, now = Date.now()): string {
	const t = Date.parse(iso);
	if (!Number.isFinite(t)) return '';
	const sec = Math.max(0, Math.round((now - t) / 1000));
	if (sec < 60) return 'עכשיו';
	const min = Math.round(sec / 60);
	if (min < 60) return `לפני ${min} דק׳`;
	const h = Math.round(min / 60);
	if (h < 24) return h === 1 ? 'לפני שעה' : `לפני ${h} שע׳`;
	const days = Math.round(h / 24);
	if (days === 1) return 'אתמול';
	if (days < 7) return `לפני ${days} ימים`;
	return new Date(t).toLocaleDateString('he-IL', {
		day: 'numeric',
		month: 'numeric',
		timeZone: 'Asia/Jerusalem'
	});
}

/** "12.3" / "היום" / "מחר" לתאריך יעד */
export function dueLabel(due: string, today = todayStr()): string {
	if (!due) return '';
	if (due === today) return 'היום';
	const tomorrow = todayStr(new Date(Date.parse(today + 'T12:00:00Z') + 86_400_000));
	if (due === tomorrow) return 'מחר';
	const [y, m, d] = due.split('-').map(Number);
	const sameYear = today.startsWith(String(y));
	return sameYear ? `${d}.${m}` : `${d}.${m}.${String(y).slice(2)}`;
}

/** קישור וואטסאפ: 05x-xxxxxxx → 9725xxxxxxxx, עם טקסט מוכן */
export function waLink(phone: string, text: string): string {
	const digits = phone.replace(/\D/g, '');
	if (!digits) return '';
	const intl = digits.startsWith('0') ? '972' + digits.slice(1) : digits;
	return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
