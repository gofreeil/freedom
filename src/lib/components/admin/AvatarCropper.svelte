<script lang="ts">
	// ============================================================
	// חלון מיקום/מרכוז תמונת אדמין: גרירה למיקום + זום,
	// והתוצאה נאפית לריבוע 256×256 (JPEG) שנשמר כ-data URL.
	// ============================================================
	let {
		file,
		onsave,
		oncancel
	}: { file: File; onsave: (dataUrl: string) => void; oncancel: () => void } = $props();

	const VIEW = 240; // גודל חלון החיתוך העגול (px)
	const OUT = 256; // גודל התמונה הנשמרת (px)

	let img = $state<HTMLImageElement | null>(null);
	let zoom = $state(1); // 1 = התמונה בדיוק מכסה את החלון
	let offsetX = $state(0);
	let offsetY = $state(0);
	let dragging = false;
	let lastX = 0;
	let lastY = 0;

	const url = URL.createObjectURL(file);
	{
		const i = new Image();
		i.onload = () => (img = i);
		i.src = url;
	}

	const coverScale = $derived(img ? Math.max(VIEW / img.naturalWidth, VIEW / img.naturalHeight) : 1);
	const scale = $derived(coverScale * zoom);

	// מגביל את ההיסט כך שהתמונה תמיד תכסה את כל החלון
	function clampOffset() {
		if (!img) return;
		const maxX = Math.max(0, (img.naturalWidth * scale - VIEW) / 2);
		const maxY = Math.max(0, (img.naturalHeight * scale - VIEW) / 2);
		offsetX = Math.min(maxX, Math.max(-maxX, offsetX));
		offsetY = Math.min(maxY, Math.max(-maxY, offsetY));
	}
	$effect(() => {
		scale; // הצמדה מחדש בכל שינוי זום
		clampOffset();
	});

	function onPointerDown(e: PointerEvent) {
		dragging = true;
		lastX = e.clientX;
		lastY = e.clientY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		offsetX += e.clientX - lastX;
		offsetY += e.clientY - lastY;
		lastX = e.clientX;
		lastY = e.clientY;
		clampOffset();
	}
	function onPointerUp() {
		dragging = false;
	}

	function cancel() {
		URL.revokeObjectURL(url);
		oncancel();
	}

	function save() {
		if (!img) return;
		const canvas = document.createElement('canvas');
		canvas.width = OUT;
		canvas.height = OUT;
		const ctx = canvas.getContext('2d')!;
		ctx.fillStyle = '#111827';
		ctx.fillRect(0, 0, OUT, OUT);
		// חלון התצוגה בקואורדינטות של התמונה המקורית
		const sx = img.naturalWidth / 2 - (VIEW / 2 + offsetX) / scale;
		const sy = img.naturalHeight / 2 - (VIEW / 2 + offsetY) / scale;
		const sSize = VIEW / scale;
		ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUT, OUT);
		const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
		URL.revokeObjectURL(url);
		onsave(dataUrl);
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && cancel()} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
	role="dialog"
	aria-modal="true"
	aria-label="מיקום תמונת האדמין"
	dir="rtl"
>
	<div class="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-4 shadow-2xl">
		<h2 class="mb-3 text-sm font-bold text-white">גררו את התמונה כדי למרכז אותה</h2>

		<div
			class="relative mx-auto cursor-move overflow-hidden rounded-full border-2 border-white/20 bg-black/40"
			style="width:{VIEW}px;height:{VIEW}px;touch-action:none"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			role="application"
			aria-label="גרירת התמונה למיקום הרצוי"
		>
			{#if img}
				<img
					src={url}
					alt=""
					draggable="false"
					class="pointer-events-none absolute max-w-none select-none"
					style="width:{img.naturalWidth * scale}px;height:{img.naturalHeight * scale}px;left:{VIEW / 2 + offsetX - (img.naturalWidth * scale) / 2}px;top:{VIEW / 2 + offsetY - (img.naturalHeight * scale) / 2}px"
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center text-xs text-gray-400">טוען…</div>
			{/if}
		</div>

		<label class="mt-4 block">
			<span class="text-xs font-semibold text-gray-400">זום</span>
			<input type="range" min="1" max="3" step="0.01" bind:value={zoom} class="w-full accent-pink-500" />
		</label>

		<div class="mt-4 flex justify-end gap-2">
			<button
				type="button"
				onclick={cancel}
				class="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-gray-300 transition hover:bg-white/10"
			>
				ביטול
			</button>
			<button
				type="button"
				onclick={save}
				disabled={!img}
				class="rounded-lg bg-gradient-to-r from-amber-500 to-pink-600 px-4 py-1.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
			>
				שמירה
			</button>
		</div>
	</div>
</div>
