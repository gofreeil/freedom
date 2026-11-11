<script lang="ts">
	import { onMount } from 'svelte';

	interface UserProp {
		name?: string;
		email?: string;
		image?: string;
		canManage?: boolean;
	}

	interface SuccessComment {
		id: string;
		userName: string;
		userAvatar?: string;
		text: string;
		createdAt: string;
	}

	interface SuccessPost {
		id: string;
		authorName: string;
		authorRole?: string;
		authorAvatar?: string;
		createdAt: string;
		category: string;
		content: string;
		imageUrl?: string;
		reactions: Record<string, number>;
		userReaction?: string;
		comments: SuccessComment[];
	}

	let { user = null, canManage = false }: { user?: UserProp | null; canManage?: boolean } = $props();

	const STORAGE_KEY = 'freedom_movement_successes_v1';

	const INITIAL_POSTS: SuccessPost[] = [
		{
			id: 'succ-1',
			authorName: 'תנועת יוצאים לחירות',
			authorRole: 'הנהלת הרשת',
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
			category: 'שקיפות ציבורית',
			content: 'גאים להכריז על השקת מערכת התקציב השקוף של יוצאים לחירות! 🚀\nהפלטפורמה מאפשרת לכל חבר קהילה לצפות בשקיפות של 100% בכל שקל שנכנס ויוצא, להצביע על הקצאות תקציביות ולהשפיע ישירות על סדר העדיפויות הציבורי.',
			imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
			reactions: { '👍': 58, '❤️': 36, '🔥': 27, '🚀': 44 },
			comments: [
				{
					id: 'sc-1',
					userName: 'רועי כהן',
					text: 'צעד ענק לשקיפות אמיתית בישראל! כל הכבוד לכל מי שהוביל.',
					createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
				}
			]
		},
		{
			id: 'succ-2',
			authorName: 'מערך התקשורת והשידורים',
			authorRole: 'חירות TV',
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
			category: 'חשיפה תקשורתית',
			content: 'שידור הבכורה של "חירות TV" שבר שיאי צפייה! 📺\nמעל 15,000 צפיות בשידור החי בדיון על זכויות הפרט והמאבק בריכוזיות. תודה לכל האורחים, הדוברים והמשתתפים שהגיבו בלייב.',
			imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
			reactions: { '👍': 82, '🔥': 53, '👏': 40 },
			comments: []
		},
		{
			id: 'succ-3',
			authorName: 'המערך המשפטי והחקיקתי',
			authorRole: 'הצוות המשפטי',
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
			category: 'הישג משפטי',
			content: 'ניצחון בעתירה לבג״ץ להגנה על שקיפות המידע הציבורי! ⚖️\nבית המשפט קיבל את עמדת התנועה וחייב את הרשויות לחשוף פרוטוקולים והחלטות שהוסתרו מהציבור. תקדים חשוב לזכויות האזרח.',
			imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
			reactions: { '👍': 96, '❤️': 61, '🔥': 48, '👏': 54 },
			comments: []
		}
	];

	let posts = $state<SuccessPost[]>([]);
	let isLoaded = $state(false);

	// פילטרים
	let selectedCategory = $state<string>('הכל');
	let searchQuery = $state('');

	// טופס פוסט חדש (לאדמינים)
	let showComposer = $state(false);
	let newContent = $state('');
	let newCategory = $state('שקיפות ציבורית');
	let newImageUrl = $state('');
	let imagePreview = $state('');
	let fileInputRef = $state<HTMLInputElement | null>(null);

	// עריכת פוסט
	let editingPostId = $state<string | null>(null);
	let editContent = $state('');
	let editImageUrl = $state('');
	let editCategory = $state('');

	// תגובות פתוחות
	let openComments = $state<Record<string, boolean>>({});
	let commentDrafts = $state<Record<string, string>>({});

	// Lightbox
	let previewImageModal = $state<string | null>(null);

	// Toast
	let copyNotice = $state<string | null>(null);

	const CATEGORIES = ['הכל', 'שקיפות ציבורית', 'חשיפה תקשורתית', 'הישג משפטי', 'התרחבות קהילתית', 'פעילות שטח'];
	const EMOJI_REACTIONS = ['👍', '❤️', '👏', '🚀', '🔥'];

	onMount(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) {
					posts = parsed;
				} else {
					posts = INITIAL_POSTS;
				}
			} else {
				posts = INITIAL_POSTS;
			}
		} catch {
			posts = INITIAL_POSTS;
		} finally {
			isLoaded = true;
		}
	});

	function savePosts(newPosts: SuccessPost[]) {
		posts = newPosts;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
		} catch (e) {
			console.error('Failed to save successes to localStorage', e);
		}
	}

	function handleImageUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert('יש לבחור קובץ תמונה בלבד');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert('גודל התמונה מוגבל לעד 5MB');
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = reader.result as string;
			imagePreview = dataUrl;
			newImageUrl = dataUrl;
		};
		reader.readAsDataURL(file);
	}

	function removeSelectedImage() {
		newImageUrl = '';
		imagePreview = '';
		if (fileInputRef) fileInputRef.value = '';
	}

	function handleCreatePost(e: SubmitEvent) {
		e.preventDefault();
		if (!newContent.trim()) return;

		const post: SuccessPost = {
			id: `succ-${Date.now()}`,
			authorName: user?.name || 'הנהלת התנועה',
			authorRole: 'הנהלת יוצאים לחירות',
			authorAvatar: user?.image || '',
			createdAt: new Date().toISOString(),
			category: newCategory,
			content: newContent.trim(),
			imageUrl: (imagePreview || newImageUrl.trim()) || undefined,
			reactions: {},
			comments: []
		};

		savePosts([post, ...posts]);

		newContent = '';
		newImageUrl = '';
		imagePreview = '';
		if (fileInputRef) fileInputRef.value = '';
		showComposer = false;
	}

	function handleDeletePost(id: string) {
		if (!confirm('האם למחוק פוסט הצלחה זה?')) return;
		savePosts(posts.filter((p) => p.id !== id));
	}

	function startEditPost(p: SuccessPost) {
		editingPostId = p.id;
		editContent = p.content;
		editImageUrl = p.imageUrl || '';
		editCategory = p.category;
	}

	function saveEditPost(id: string) {
		if (!editContent.trim()) return;
		const updated = posts.map((p) => {
			if (p.id !== id) return p;
			return {
				...p,
				content: editContent.trim(),
				imageUrl: editImageUrl.trim() || undefined,
				category: editCategory || p.category
			};
		});
		savePosts(updated);
		editingPostId = null;
	}

	function toggleReaction(post: SuccessPost, emoji: string) {
		const updated = posts.map((p) => {
			if (p.id !== post.id) return p;
			const r = { ...p.reactions };
			const prev = p.userReaction;

			if (prev === emoji) {
				r[emoji] = Math.max(0, (r[emoji] || 1) - 1);
				if (r[emoji] === 0) delete r[emoji];
				return { ...p, reactions: r, userReaction: undefined };
			} else {
				if (prev && r[prev]) {
					r[prev] = Math.max(0, r[prev] - 1);
					if (r[prev] === 0) delete r[prev];
				}
				r[emoji] = (r[emoji] || 0) + 1;
				return { ...p, reactions: r, userReaction: emoji };
			}
		});
		savePosts(updated);
	}

	function handleAddComment(postId: string, e: SubmitEvent) {
		e.preventDefault();
		const text = (commentDrafts[postId] || '').trim();
		if (!text) return;

		const updated = posts.map((p) => {
			if (p.id !== postId) return p;
			const newComm: SuccessComment = {
				id: `c-${Date.now()}`,
				userName: user?.name || 'משתתף/ת',
				userAvatar: user?.image || '',
				text,
				createdAt: new Date().toISOString()
			};
			return {
				...p,
				comments: [...p.comments, newComm]
			};
		});

		savePosts(updated);
		commentDrafts[postId] = '';
	}

	function sharePost(post: SuccessPost) {
		const text = `🌟 ${post.content.slice(0, 80)}...`;
		const url = window.location.href;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(`${text}\n${url}`);
			copyNotice = 'הקישור הועתק ללוח!';
			setTimeout(() => (copyNotice = null), 2500);
		} else {
			prompt('העתק את הקישור:', url);
		}
	}

	function formatTime(iso: string): string {
		try {
			const d = new Date(iso);
			const now = new Date();
			const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

			if (diffHours < 1) {
				const mins = Math.max(1, Math.floor(diffHours * 60));
				return `לפני ${mins} דקות`;
			}
			if (diffHours < 24) {
				return `לפני ${Math.floor(diffHours)} שעות`;
			}
			if (diffHours < 48) {
				return 'אתמול';
			}
			return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
		} catch {
			return iso;
		}
	}

	const filteredPosts = $derived(
		posts.filter((p) => {
			const matchCategory = selectedCategory === 'הכל' || p.category === selectedCategory;
			const q = searchQuery.trim().toLowerCase();
			const matchQuery =
				!q ||
				p.content.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q);
			return matchCategory && matchQuery;
		})
	);
</script>

<div class="mx-auto max-w-3xl px-3 sm:px-4 py-3 sm:py-5" dir="rtl">
	<!-- Hero קומפקטי: כותרת ואייקון באותה שורה, משפט אחד, כפתור קטן -->
	<header class="mb-4 flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3">
		<div class="flex items-center gap-2.5">
			<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-2xl ring-1 ring-amber-500/40 shadow-sm" aria-hidden="true">
				🌟
			</span>
			<div>
				<h1 class="text-lg sm:text-xl font-black text-white flex items-center gap-2">
					ההצלחות שלנו
					<span class="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
						תנועת יוצאים לחירות
					</span>
				</h1>
				<p class="text-xs sm:text-sm text-gray-300">הישגים, הצלחות, מאבקים ציבוריים ואבני דרך של התנועה החברתית</p>
			</div>
		</div>

		{#if canManage}
			<button
				type="button"
				onclick={() => (showComposer = !showComposer)}
				class="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/25 to-pink-500/20 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-amber-200 transition hover:bg-amber-500/30 cursor-pointer shadow-sm"
			>
				<span>{showComposer ? '✕ סגור' : '➕ פרסום הצלחה'}</span>
			</button>
		{/if}
	</header>

	<!-- תיבת פרסום הצלחה של התנועה (לאדמינים) -->
	{#if canManage && showComposer}
		<form
			onsubmit={handleCreatePost}
			class="mb-4 overflow-hidden rounded-2xl border border-amber-400/30 bg-[#161f36] p-3.5 sm:p-4 shadow-xl transition-all"
		>
			<div class="mb-2.5 flex items-center gap-2.5 border-b border-white/10 pb-2.5">
				<span class="text-xl" aria-hidden="true">📢</span>
				<div class="min-w-0 flex-1">
					<p class="text-xs sm:text-sm font-bold text-white truncate">פרסום הישג או הצלחה של התנועה</p>
					<span class="text-[10px] text-amber-300">יוצג לכלל הציבור בדף ההצלחות</span>
				</div>
				<select
					bind:value={newCategory}
					class="rounded-lg border border-white/15 bg-[#0f1626] px-2.5 py-1 text-xs font-bold text-gray-200 focus:border-amber-400 focus:outline-none"
				>
					{#each CATEGORIES.filter((c) => c !== 'הכל') as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>

			<textarea
				bind:value={newContent}
				required
				rows="3"
				placeholder="פרטו את ההצלחה, ההישג הציבורי או הניצחון של התנועה החברתית..."
				class="w-full rounded-xl border border-white/10 bg-[#0f1626] p-3 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-amber-400/60 focus:outline-none resize-y leading-relaxed"
			></textarea>

			<!-- תצוגה מקדימה של תמונה -->
			{#if imagePreview || newImageUrl}
				<div class="relative mt-2.5 overflow-hidden rounded-xl border border-white/10 bg-black/40">
					<img src={imagePreview || newImageUrl} alt="תצוגה מקדימה" class="max-h-60 w-full object-cover" />
					<button
						type="button"
						onclick={removeSelectedImage}
						class="absolute top-2 start-2 rounded-full bg-black/75 p-1.5 text-xs text-white hover:bg-red-600 transition"
						title="הסרת תמונה"
					>
						✕
					</button>
				</div>
			{/if}

			<!-- אפשרויות צירוף מדיה -->
			<div class="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
				<div class="flex items-center gap-2">
					<label class="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-gray-200 hover:bg-white/10 cursor-pointer transition">
						<span aria-hidden="true">🖼️</span>
						<span>העלאת תמונה</span>
						<input
							type="file"
							accept="image/*"
							bind:this={fileInputRef}
							onchange={handleImageUpload}
							class="hidden"
						/>
					</label>

					<input
						type="url"
						placeholder="או הדביקו קישור לתמונה..."
						bind:value={newImageUrl}
						class="rounded-lg border border-white/15 bg-[#0f1626] px-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none w-44 sm:w-56"
					/>
				</div>

				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => (showComposer = false)}
						class="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-gray-400 hover:bg-white/5 cursor-pointer"
					>
						ביטול
					</button>
					<button
						type="submit"
						disabled={!newContent.trim()}
						class="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-pink-600 px-4 py-1.5 text-xs sm:text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40 cursor-pointer shadow-sm"
					>
						<span>פרסם הצלחה</span>
						<span aria-hidden="true">🚀</span>
					</button>
				</div>
			</div>
		</form>
	{/if}

	<!-- סרגל חיפוש וקטגוריות קומפקטי -->
	<div class="mb-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#141c2f] p-2.5">
		<div class="relative min-w-[150px] flex-1">
			<input
				type="search"
				bind:value={searchQuery}
				placeholder="חיפוש בהצלחות התנועה..."
				class="w-full rounded-lg border border-white/15 bg-white/5 py-1.5 pe-3 ps-8 text-xs sm:text-sm text-white placeholder-gray-400 focus:border-amber-400/60 focus:outline-none"
			/>
			<span class="pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-xs text-gray-400" aria-hidden="true">
				🔍
			</span>
		</div>

		<div class="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
			{#each CATEGORIES as cat}
				<button
					type="button"
					onclick={() => (selectedCategory = cat)}
					class="whitespace-nowrap rounded-lg px-2.5 py-1 font-bold transition cursor-pointer {selectedCategory === cat
						? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
						: 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}"
				>
					{cat}
				</button>
			{/each}
		</div>
	</div>

	<!-- פיד ההצלחות של התנועה -->
	<div class="space-y-3.5">
		{#if !isLoaded}
			<div class="h-40 animate-pulse rounded-2xl bg-[#141c2f]" aria-hidden="true"></div>
		{:else if filteredPosts.length === 0}
			<div class="rounded-2xl border border-white/10 bg-[#141c2f] p-8 text-center">
				<span class="text-4xl" aria-hidden="true">🌟</span>
				<p class="mt-2 text-base font-bold text-gray-200">
					{searchQuery || selectedCategory !== 'הכל' ? 'לא נמצאו הצלחות התואמות לחיפוש' : 'עדיין לא פורסמו הצלחות'}
				</p>
			</div>
		{:else}
			{#each filteredPosts as post (post.id)}
				{@const totalReactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)}
				<article class="overflow-hidden rounded-2xl border border-white/10 bg-[#141c2f] shadow-lg transition hover:border-white/20">
					<!-- ראש הפוסט -->
					<div class="flex items-center justify-between gap-2 p-3.5 sm:p-4 border-b border-white/5">
						<div class="flex items-center gap-3 min-w-0">
							{#if post.authorAvatar}
								<img src={post.authorAvatar} alt="" class="h-10 w-10 rounded-full object-cover border border-amber-400/40" />
							{:else}
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-pink-600 text-sm font-bold text-white shrink-0">
									🕊️
								</div>
							{/if}
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<h2 class="text-sm sm:text-base font-black text-white truncate">{post.authorName}</h2>
									{#if post.authorRole}
										<span class="rounded bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 shrink-0">
											{post.authorRole}
										</span>
									{/if}
								</div>
								<div class="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
									<time datetime={post.createdAt}>{formatTime(post.createdAt)}</time>
									<span>·</span>
									<span class="text-amber-300 font-semibold">{post.category}</span>
								</div>
							</div>
						</div>

						{#if canManage}
							<div class="flex items-center gap-1">
								<button
									type="button"
									onclick={() => startEditPost(post)}
									class="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer text-xs"
									title="עריכת פוסט"
								>
									✏️
								</button>
								<button
									type="button"
									onclick={() => handleDeletePost(post.id)}
									class="rounded-lg p-1.5 text-gray-400 hover:bg-red-950/40 hover:text-red-300 cursor-pointer text-xs"
									title="מחיקת פוסט"
								>
									🗑️
								</button>
							</div>
						{/if}
					</div>

					<!-- תוכן / עריכה -->
					{#if editingPostId === post.id}
						<div class="p-3 border-b border-white/10 bg-[#0f1626]">
							<textarea
								bind:value={editContent}
								rows="3"
								class="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
							></textarea>
							<input
								type="url"
								bind:value={editImageUrl}
								placeholder="כתובת תמונה..."
								class="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white"
							/>
							<div class="mt-2 flex justify-end gap-2">
								<button
									type="button"
									onclick={() => (editingPostId = null)}
									class="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-gray-300"
								>
									ביטול
								</button>
								<button
									type="button"
									onclick={() => saveEditPost(post.id)}
									class="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-black"
								>
									שמור שינויים
								</button>
							</div>
						</div>
					{:else}
						<div class="px-4 py-3">
							<p class="text-sm sm:text-base leading-relaxed text-gray-100 whitespace-pre-line break-words">
								{post.content}
							</p>
						</div>

						{#if post.imageUrl}
							<button
								type="button"
								class="relative block w-full bg-black/30 overflow-hidden cursor-pointer p-0 border-0 text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
								onclick={() => (previewImageModal = post.imageUrl || null)}
							>
								<img
									src={post.imageUrl}
									alt="תמונת הצלחה"
									loading="lazy"
									class="max-h-96 w-full object-cover transition hover:opacity-95"
								/>
								<div class="absolute bottom-2 end-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white font-semibold backdrop-blur-xs flex items-center gap-1">
									<span>🔍 הגדל</span>
								</div>
							</button>
						{/if}
					{/if}

					<!-- סטטיסטיקה -->
					{#if totalReactions > 0 || post.comments.length > 0}
						<div class="flex items-center justify-between px-4 py-1.5 text-xs text-gray-400 border-b border-white/5">
							<div class="flex items-center gap-1.5">
								<div class="flex -space-x-1 rtl:space-x-reverse">
									{#each Object.keys(post.reactions || {}) as em}
										<span class="inline-block transform hover:scale-110">{em}</span>
									{/each}
								</div>
								{#if totalReactions > 0}
									<span class="font-bold text-gray-300">{totalReactions}</span>
								{/if}
							</div>

							{#if post.comments.length > 0}
								<button
									type="button"
									onclick={() => (openComments[post.id] = !openComments[post.id])}
									class="hover:underline cursor-pointer"
								>
									{post.comments.length} {post.comments.length === 1 ? 'תגובה' : 'תגובות'}
								</button>
							{/if}
						</div>
					{/if}

					<!-- פעולות -->
					<div class="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5 bg-white/[0.01] text-xs sm:text-sm">
						<div class="group relative flex items-center justify-center py-2 text-gray-300 transition hover:bg-white/5">
							<button
								type="button"
								onclick={() => toggleReaction(post, '👍')}
								class="flex items-center gap-1.5 font-bold cursor-pointer {post.userReaction ? 'text-amber-300' : 'text-gray-300'}"
							>
								<span>{post.userReaction || '👍'}</span>
								<span>{post.userReaction ? 'אהבתי' : 'לייק'}</span>
							</button>

							<div class="absolute bottom-full mb-1 hidden group-hover:flex items-center gap-1 rounded-full border border-white/15 bg-[#0f1626] px-2 py-1 shadow-2xl z-10">
								{#each EMOJI_REACTIONS as em}
									<button
										type="button"
										onclick={() => toggleReaction(post, em)}
										class="p-1 text-base transition transform hover:scale-130 active:scale-95 cursor-pointer"
										title={em}
									>
										{em}
									</button>
								{/each}
							</div>
						</div>

						<button
							type="button"
							onclick={() => (openComments[post.id] = !openComments[post.id])}
							class="flex items-center justify-center gap-1.5 py-2 font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
						>
							<span aria-hidden="true">💬</span>
							<span>תגובה</span>
						</button>

						<button
							type="button"
							onclick={() => sharePost(post)}
							class="flex items-center justify-center gap-1.5 py-2 font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
						>
							<span aria-hidden="true">🔗</span>
							<span>שתף</span>
						</button>
					</div>

					<!-- אזור תגובות -->
					{#if openComments[post.id] || post.comments.length > 0}
						<div class="border-t border-white/5 bg-[#0e1525] p-3.5 space-y-2.5">
							{#if post.comments.length > 0}
								<div class="space-y-2 max-h-56 overflow-y-auto pe-1">
									{#each post.comments as c (c.id)}
										<div class="flex items-start gap-2.5 text-xs">
											{#if c.userAvatar}
												<img src={c.userAvatar} alt="" class="h-6 w-6 rounded-full object-cover shrink-0 mt-0.5" />
											{:else}
												<div class="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-300 shrink-0 mt-0.5">
													{c.userName.charAt(0)}
												</div>
											{/if}
											<div class="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-1.5 border border-white/5">
												<div class="flex items-center justify-between gap-1">
													<span class="font-bold text-white text-xs">{c.userName}</span>
													<time datetime={c.createdAt} class="text-[9px] text-gray-500">{formatTime(c.createdAt)}</time>
												</div>
												<p class="text-gray-200 text-xs mt-0.5 break-words">{c.text}</p>
											</div>
										</div>
									{/each}
								</div>
							{/if}

							<form onsubmit={(e) => handleAddComment(post.id, e)} class="flex items-center gap-1.5 pt-1">
								<input
									type="text"
									placeholder="כתבו תגובה או פרגון להצלחה זו..."
									value={commentDrafts[post.id] || ''}
									oninput={(e) => (commentDrafts[post.id] = (e.currentTarget as HTMLInputElement).value)}
									class="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
								/>
								<button
									type="submit"
									disabled={!(commentDrafts[post.id] || '').trim()}
									class="rounded-lg bg-amber-500/25 border border-amber-400/30 px-3.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/35 disabled:opacity-40 cursor-pointer"
								>
									שלח
								</button>
							</form>
						</div>
					{/if}
				</article>
			{/each}
		{/if}
	</div>
</div>

<!-- Lightbox לתמונה מוגדלת -->
{#if previewImageModal}
	<div
		class="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
		onclick={() => (previewImageModal = null)}
		onkeydown={(e) => {
			if (e.key === 'Escape') previewImageModal = null;
		}}
		role="button"
		tabindex="0"
		aria-label="סגירת תמונה מוגדלת"
	>
		<div class="relative max-h-[90vh] max-w-4xl" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<button
				type="button"
				onclick={() => (previewImageModal = null)}
				class="absolute top-2 start-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black cursor-pointer text-sm font-bold"
				aria-label="סגירה"
			>
				✕
			</button>
			<img src={previewImageModal} alt="הצלחה מוגדלת" class="max-h-[85vh] w-auto max-w-full rounded-xl object-contain shadow-2xl" />
		</div>
	</div>
{/if}

<!-- Toast הודעת העתקה -->
{#if copyNotice}
	<div class="fixed bottom-4 inset-x-0 z-[160] flex justify-center pointer-events-none" aria-live="polite">
		<div class="rounded-xl border border-emerald-400/40 bg-emerald-950/95 px-4 py-2 text-xs sm:text-sm font-bold text-emerald-100 shadow-2xl">
			{copyNotice}
		</div>
	</div>
{/if}
