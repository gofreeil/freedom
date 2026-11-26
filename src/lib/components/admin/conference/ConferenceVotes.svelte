<script lang="ts">
	// ConferenceVotes.svelte — מערכת הצבעות הנהלה, חתימה וארכיון חתום בדף הישיבות/ועידה
	import { onMount } from 'svelte';

	interface Props {
		user?: {
			name?: string;
			email?: string;
			canManage?: boolean;
		};
	}

	interface VoteOption {
		id: string;
		label: string;
	}

	interface CastVote {
		voterKey: string;
		voterName: string;
		optionId: string;
		votedAt: string;
	}

	interface ManagementVote {
		id: string;
		title: string;
		description?: string;
		createdAt: string;
		createdBy: string;
		status: 'open' | 'signed';
		options: VoteOption[];
		votes: CastVote[];
		signedBy?: string;
		signedAt?: string;
		signatureCode?: string;
		resolution?: string;
		closingNote?: string;
	}

	let { user }: Props = $props();

	const STORAGE_KEY = 'freedom_conference_votes_v1';

	let items = $state<ManagementVote[]>([]);
	let showCreateForm = $state(false);
	let viewFilter = $state<'all' | 'open' | 'signed'>('all');
	let expandedArchiveId = $state<string | null>(null);
	let signingId = $state<string | null>(null);
	let signerNameInput = $state('');
	let closingNoteInput = $state('');
	let copiedVoteId = $state<string | null>(null);

	// שדות יצירת הצבעה חדשה
	let newTitle = $state('');
	let newDescription = $state('');
	let useCustomOptions = $state(false);
	let customOptionsText = $state('');

	const currentVoterName = $derived((user?.name || user?.email || 'חבר הנהלה').trim());
	const currentVoterKey = $derived((user?.email || user?.name || 'member').trim().toLowerCase());

	const openVotes = $derived(items.filter((v) => v.status === 'open'));
	const signedVotes = $derived(items.filter((v) => v.status === 'signed'));

	onMount(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) {
					items = parsed;
				}
			}
		} catch {}
	});

	function persist(next: ManagementVote[]) {
		items = next;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {}
	}

	function createVote(e: SubmitEvent) {
		e.preventDefault();
		const title = newTitle.trim();
		if (!title) return;

		let options: VoteOption[] = [
			{ id: 'for', label: 'בעד' },
			{ id: 'against', label: 'נגד' },
			{ id: 'abstain', label: 'נמנע' }
		];

		if (useCustomOptions) {
			const parsed = customOptionsText
				.split(/[\n,]/)
				.map((s) => s.trim())
				.filter(Boolean);
			if (parsed.length >= 2) {
				options = parsed.map((label, idx) => ({
					id: `opt-${idx + 1}`,
					label
				}));
			}
		}

		const created: ManagementVote = {
			id: `vote-${Date.now()}`,
			title,
			description: newDescription.trim() || undefined,
			createdAt: new Date().toISOString(),
			createdBy: currentVoterName,
			status: 'open',
			options,
			votes: []
		};

		persist([created, ...items]);
		newTitle = '';
		newDescription = '';
		useCustomOptions = false;
		customOptionsText = '';
		showCreateForm = false;
		if (viewFilter === 'signed') viewFilter = 'all';
	}

	function castVote(voteId: string, optionId: string) {
		const next = items.map((item) => {
			if (item.id !== voteId || item.status !== 'open') return item;
			const filtered = item.votes.filter((v) => v.voterKey !== currentVoterKey);
			return {
				...item,
				votes: [
					...filtered,
					{
						voterKey: currentVoterKey,
						voterName: currentVoterName,
						optionId,
						votedAt: new Date().toISOString()
					}
				]
			};
		});
		persist(next);
	}

	function getMyChoice(item: ManagementVote): string | null {
		return item.votes.find((v) => v.voterKey === currentVoterKey)?.optionId ?? null;
	}

	function countForOption(item: ManagementVote, optionId: string): number {
		return item.votes.filter((v) => v.optionId === optionId).length;
	}

	function computeResolution(item: ManagementVote): string {
		if (item.votes.length === 0) return 'נסגרה ללא הצבעות';

		// בדיקה סטנדרטית עבור בעד / נגד / נמנע
		const isStandard =
			item.options.some((o) => o.id === 'for') && item.options.some((o) => o.id === 'against');
		if (isStandard) {
			const forCount = countForOption(item, 'for');
			const againstCount = countForOption(item, 'against');
			if (forCount > againstCount) return 'אושרה';
			if (againstCount > forCount) return 'נדחתה';
			return 'תיקו';
		}

		let max = -1;
		let winners: string[] = [];
		for (const opt of item.options) {
			const c = countForOption(item, opt.id);
			if (c > max) {
				max = c;
				winners = [opt.label];
			} else if (c === max) {
				winners.push(opt.label);
			}
		}
		if (winners.length === 1) return `נבחרה: ${winners[0]}`;
		return `תיקו (${winners.join(' / ')})`;
	}

	function generateSignatureCode(voteId: string, signer: string): string {
		const seed = `${voteId}-${signer}-${Date.now()}`;
		let hash = 0;
		for (let i = 0; i < seed.length; i++) {
			hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
		}
		const hex = hash.toString(16).toUpperCase().padStart(8, '0');
		return `SIG-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
	}

	function openSignBox(item: ManagementVote) {
		signingId = item.id;
		signerNameInput = currentVoterName;
		closingNoteInput = '';
	}

	function confirmSignAndArchive(voteId: string) {
		const signer = signerNameInput.trim() || currentVoterName;
		const signedAt = new Date().toISOString();
		const next = items.map((item) => {
			if (item.id !== voteId || item.status !== 'open') return item;
			return {
				...item,
				status: 'signed' as const,
				signedBy: signer,
				signedAt,
				signatureCode: generateSignatureCode(item.id, signer),
				resolution: computeResolution(item),
				closingNote: closingNoteInput.trim() || undefined
			};
		});
		persist(next);
		signingId = null;
		closingNoteInput = '';
		expandedArchiveId = voteId;
	}

	function deleteVote(voteId: string, title: string) {
		if (!confirm(`האם למחוק את ההצבעה "${title}"?`)) return;
		persist(items.filter((v) => v.id !== voteId));
		if (expandedArchiveId === voteId) expandedArchiveId = null;
	}

	function formatDateTime(iso?: string): string {
		if (!iso) return '';
		try {
			return new Date(iso).toLocaleString('he-IL', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return iso.slice(0, 10);
		}
	}

	function tallySummary(item: ManagementVote): string {
		return item.options.map((o) => `${o.label}: ${countForOption(item, o.id)}`).join(' | ');
	}

	async function copyArchiveSummary(item: ManagementVote) {
		const lines = [
			`החלטת הנהלה חתומה: ${item.title}`,
			item.description ? `פירוט: ${item.description}` : '',
			`תוצאה: ${item.resolution || '-'} (${tallySummary(item)})`,
			item.closingNote ? `הערת סיום: ${item.closingNote}` : '',
			`נחתם ע"י: ${item.signedBy} | תאריך: ${formatDateTime(item.signedAt)} | חתימה: ${item.signatureCode}`
		]
			.filter(Boolean)
			.join('\n');

		try {
			await navigator.clipboard.writeText(lines);
			copiedVoteId = item.id;
			setTimeout(() => {
				if (copiedVoteId === item.id) copiedVoteId = null;
			}, 2000);
		} catch {}
	}

	function resolutionBadgeClass(resolution?: string): string {
		if (!resolution) return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
		if (resolution === 'אושרה' || resolution.startsWith('נבחרה:')) {
			return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
		}
		if (resolution === 'נדחתה') {
			return 'bg-red-500/20 text-red-300 border-red-400/40';
		}
		return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
	}
</script>

<section class="rounded-xl border border-indigo-500/25 bg-[#0f1626]/90 p-3.5 shadow-lg space-y-3" dir="rtl">
	<!-- כותרת קומפקטית + פילטר + כפתור יצירה -->
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
		<div class="flex items-center gap-2">
			<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-sm text-indigo-300 ring-1 ring-indigo-400/30" aria-hidden="true">
				🗳️
			</span>
			<div>
				<h3 class="text-sm font-black text-white leading-tight">הצבעות הנהלה וארכיון חתום</h3>
				<p class="text-[11px] text-gray-400">יצירת הצבעות הנהלה, חתימה בסיום ותיעוד מיידי בארכיון</p>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-1.5">
			<div class="inline-flex rounded-lg border border-white/10 bg-black/30 p-0.5 text-[11px] font-bold">
				<button
					type="button"
					onclick={() => (viewFilter = 'all')}
					class="rounded-md px-2 py-1 transition cursor-pointer {viewFilter === 'all' ? 'bg-indigo-500/30 text-indigo-200' : 'text-gray-400 hover:text-white'}"
				>
					הכל ({items.length})
				</button>
				<button
					type="button"
					onclick={() => (viewFilter = 'open')}
					class="rounded-md px-2 py-1 transition cursor-pointer {viewFilter === 'open' ? 'bg-teal-500/30 text-teal-200' : 'text-gray-400 hover:text-white'}"
				>
					פעילות ({openVotes.length})
				</button>
				<button
					type="button"
					onclick={() => (viewFilter = 'signed')}
					class="rounded-md px-2 py-1 transition cursor-pointer {viewFilter === 'signed' ? 'bg-amber-500/30 text-amber-200' : 'text-gray-400 hover:text-white'}"
				>
					ארכיון חתום ({signedVotes.length})
				</button>
			</div>

			{#if user?.canManage}
				<button
					type="button"
					onclick={() => (showCreateForm = !showCreateForm)}
					class="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-black text-white shadow transition hover:bg-indigo-500 cursor-pointer"
				>
					<span>{showCreateForm ? '✕ סגור' : '+ הצבעה חדשה'}</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- טופס יצירת הצבעת הנהלה חדשה -->
	{#if showCreateForm && user?.canManage}
		<form
			onsubmit={createVote}
			class="rounded-xl border border-indigo-400/30 bg-[#141c2f] p-3 space-y-2.5 text-xs"
		>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
				<div>
					<label for="new-vote-title" class="block font-bold text-gray-200 mb-1">נושא ההצבעה *</label>
					<input
						id="new-vote-title"
						type="text"
						required
						bind:value={newTitle}
						placeholder="למשל: אישור תקציב פעילות חורף"
						class="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
					/>
				</div>
				<div>
					<label for="new-vote-desc" class="block font-bold text-gray-200 mb-1">פירוט קצר (אופציונלי)</label>
					<input
						id="new-vote-desc"
						type="text"
						bind:value={newDescription}
						placeholder="רקע או פרטים להחלטה"
						class="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
					/>
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-2 pt-0.5">
				<label class="inline-flex items-center gap-1.5 text-[11px] text-gray-300 cursor-pointer">
					<input type="checkbox" bind:checked={useCustomOptions} class="rounded border-white/20 bg-black/40 accent-indigo-500" />
					<span>אפשרויות מותאמות אישית (ברירת מחדל: בעד / נגד / נמנע)</span>
				</label>

				<div class="flex items-center gap-1.5">
					<button
						type="button"
						onclick={() => (showCreateForm = false)}
						class="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
					>
						ביטול
					</button>
					<button
						type="submit"
						class="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-black text-white hover:bg-indigo-400 cursor-pointer"
					>
						פתח הצבעה
					</button>
				</div>
			</div>

			{#if useCustomOptions}
				<div>
					<input
						type="text"
						bind:value={customOptionsText}
						placeholder="הזינו לפחות 2 אפשרויות מופרדות בפסיק (למשל: אפשרות א, אפשרות ב, דחייה)"
						class="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
					/>
				</div>
			{/if}
		</form>
	{/if}

	<!-- הצבעות הנהלה פעילות -->
	{#if viewFilter !== 'signed'}
		<div class="space-y-2">
			{#if openVotes.length === 0 && viewFilter === 'open'}
				<div class="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-center text-xs text-gray-400">
					אין כרגע הצבעות הנהלה פעילות. {user?.canManage ? 'לחצו על "+ הצבעה חדשה" כדי לפתוח הצבעה.' : ''}
				</div>
			{:else}
				{#each openVotes as vote (vote.id)}
					{@const myChoice = getMyChoice(vote)}
					{@const totalVotes = vote.votes.length}
					<div class="rounded-xl border border-teal-500/30 bg-[#11192c] p-3 space-y-2.5">
						<div class="flex flex-wrap items-start justify-between gap-2">
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<span class="inline-flex items-center gap-1 rounded-md bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-bold text-teal-300 ring-1 ring-teal-500/30">
										<span class="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
										הצבעה פתוחה
									</span>
									<h4 class="text-sm font-black text-white">{vote.title}</h4>
								</div>
								{#if vote.description}
									<p class="mt-0.5 text-xs text-gray-300">{vote.description}</p>
								{/if}
								<p class="mt-0.5 text-[11px] text-gray-400">
									נפתחה ע״י {vote.createdBy} • {formatDateTime(vote.createdAt)} • {totalVotes} הצבעות
								</p>
							</div>

							{#if user?.canManage}
								<div class="flex items-center gap-1.5 shrink-0">
									<button
										type="button"
										onclick={() => (signingId === vote.id ? (signingId = null) : openSignBox(vote))}
										class="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-black text-amber-200 transition hover:bg-amber-500/30 cursor-pointer"
									>
										<span>✍️ חתום והעבר לארכיון</span>
									</button>
									<button
										type="button"
										onclick={() => deleteVote(vote.id, vote.title)}
										class="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-gray-400 hover:border-red-500/40 hover:text-red-300 cursor-pointer"
										title="מחיקת הצבעה"
									>
										🗑️
									</button>
								</div>
							{/if}
						</div>

						<!-- אפשרויות הצבעה וספירה חיה -->
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
							{#each vote.options as opt (opt.id)}
								{@const count = countForOption(vote, opt.id)}
								{@const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0}
								{@const isSelected = myChoice === opt.id}
								<button
									type="button"
									onclick={() => castVote(vote.id, opt.id)}
									class="relative overflow-hidden rounded-lg border px-3 py-2 text-right transition cursor-pointer {isSelected
										? 'border-teal-400 bg-teal-500/20 text-white ring-1 ring-teal-400/40'
										: 'border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/25 hover:bg-white/[0.06]'}"
								>
									<div
										class="pointer-events-none absolute inset-y-0 start-0 bg-teal-400/10 transition-all"
										style="width: {pct}%"
									></div>
									<div class="relative flex items-center justify-between gap-2 text-xs">
										<span class="font-bold flex items-center gap-1">
											{#if isSelected}<span class="text-teal-300">✓</span>{/if}
											{opt.label}
										</span>
										<span class="tabular-nums text-[11px] text-gray-300 font-semibold">
											{count} ({pct}%)
										</span>
									</div>
								</button>
							{/each}
						</div>

						<!-- רשימת מצביעים -->
						{#if vote.votes.length > 0}
							<div class="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400 pt-0.5">
								<span>הצביעו:</span>
								{#each vote.votes as cast (cast.voterKey)}
									{@const optLabel = vote.options.find((o) => o.id === cast.optionId)?.label ?? cast.optionId}
									<span class="rounded bg-white/5 px-1.5 py-0.5 text-gray-300 border border-white/5">
										{cast.voterName} ({optLabel})
									</span>
								{/each}
							</div>
						{/if}

						<!-- תיבת חתימה והעברה לארכיון -->
						{#if signingId === vote.id && user?.canManage}
							<div class="rounded-lg border border-amber-400/35 bg-amber-950/20 p-2.5 space-y-2 text-xs">
								<div class="flex flex-wrap items-center justify-between gap-2">
									<span class="font-bold text-amber-200">✍️ חתימה סופית והעברה מיידית לארכיון</span>
									<span class="text-[11px] text-gray-300">תוצאה מחושבת: <strong class="text-white">{computeResolution(vote)}</strong></span>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
									<input
										type="text"
										bind:value={signerNameInput}
										placeholder="שם החותם/ת"
										class="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
									/>
									<input
										type="text"
										bind:value={closingNoteInput}
										placeholder="הערת סיכום / החלטה (אופציונלי)"
										class="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
									/>
								</div>
								<div class="flex items-center justify-end gap-1.5">
									<button
										type="button"
										onclick={() => (signingId = null)}
										class="rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
									>
										ביטול
									</button>
									<button
										type="button"
										onclick={() => confirmSignAndArchive(vote.id)}
										class="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-black text-slate-950 hover:bg-amber-400 cursor-pointer"
									>
										אשר חתימה וארכב
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	{/if}

	<!-- ארכיון הצבעות חתומות -->
	{#if viewFilter !== 'open'}
		<div class="space-y-2 {viewFilter === 'all' && openVotes.length > 0 ? 'pt-2 border-t border-white/10' : ''}">
			<div class="flex items-center justify-between text-xs">
				<h4 class="font-black text-amber-200 flex items-center gap-1.5">
					<span>🔏</span>
					<span>ארכיון הצבעות חתומות</span>
				</h4>
				<span class="text-[11px] text-gray-400">{signedVotes.length} החלטות חתומות</span>
			</div>

			{#if signedVotes.length === 0}
				<div class="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-3 text-center text-xs text-gray-400">
					עדיין אין הצבעות חתומות בארכיון. לאחר סגירה וחתימה של הצבעה פעילה, היא תופיע כאן מיד.
				</div>
			{:else}
				<div class="space-y-1.5">
					{#each signedVotes as archived (archived.id)}
						{@const isExpanded = expandedArchiveId === archived.id}
						<div class="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<button
									type="button"
									onclick={() => (expandedArchiveId = isExpanded ? null : archived.id)}
									class="flex flex-1 min-w-0 items-center gap-2 text-right cursor-pointer"
								>
									<span class="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold {resolutionBadgeClass(archived.resolution)}">
										{archived.resolution || 'חתומה'}
									</span>
									<span class="font-bold text-white truncate">{archived.title}</span>
									<span class="hidden sm:inline text-[11px] text-gray-400 truncate">
										• {tallySummary(archived)}
									</span>
								</button>

								<div class="flex items-center gap-1.5 shrink-0">
									<span class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
										🔒 חתום
									</span>
									<button
										type="button"
										onclick={() => copyArchiveSummary(archived)}
										class="rounded border border-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-300 hover:bg-white/10 cursor-pointer"
										title="העתקת סיכום ההחלטה"
									>
										{copiedVoteId === archived.id ? '✓ הועתק' : '📋 העתק'}
									</button>
									<button
										type="button"
										onclick={() => (expandedArchiveId = isExpanded ? null : archived.id)}
										class="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-gray-300 hover:bg-white/10 cursor-pointer"
									>
										{isExpanded ? '▲' : '▼'}
									</button>
									{#if user?.canManage}
										<button
											type="button"
											onclick={() => deleteVote(archived.id, archived.title)}
											class="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-gray-400 hover:border-red-500/40 hover:text-red-300 cursor-pointer"
											title="מחיקה מהארכיון"
										>
											🗑️
										</button>
									{/if}
								</div>
							</div>

							<div class="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
								<span>
									נחתם ע״י <strong class="text-gray-200">{archived.signedBy}</strong> • {formatDateTime(archived.signedAt)}
								</span>
								{#if archived.signatureCode}
									<code class="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-amber-300 dir-ltr">
										{archived.signatureCode}
									</code>
								{/if}
							</div>

							{#if isExpanded}
								<div class="mt-2 border-t border-white/10 pt-2 space-y-1.5 text-[11px] text-gray-300">
									{#if archived.description}
										<p><strong class="text-gray-200">פירוט:</strong> {archived.description}</p>
									{/if}
									<p><strong class="text-gray-200">תוצאות סופיות:</strong> {tallySummary(archived)} (סה״כ {archived.votes.length} מצביעים)</p>
									{#if archived.closingNote}
										<p><strong class="text-gray-200">הערת סיכום:</strong> {archived.closingNote}</p>
									{/if}
									{#if archived.votes.length > 0}
										<div class="flex flex-wrap gap-1 pt-0.5">
											{#each archived.votes as cast (cast.voterKey)}
												{@const optLabel = archived.options.find((o) => o.id === cast.optionId)?.label ?? cast.optionId}
												<span class="rounded bg-white/5 px-1.5 py-0.5 text-gray-300 border border-white/5">
													{cast.voterName}: {optLabel}
												</span>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</section>
