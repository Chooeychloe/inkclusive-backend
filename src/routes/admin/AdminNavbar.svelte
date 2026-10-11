<script lang="ts">
	import { ArrowLeft, ShieldCheck } from '@lucide/svelte';
</script>

<header class="sticky top-0 z-20 border-b border-violet-100 bg-white/90 backdrop-blur-md">
	<div class="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between px-4 sm:px-8">
		<a href="/dashboard/editor" class="group flex items-center gap-3" aria-label="Back to Inkclusive editor">
			<img src="/inkclusive.svg" alt="" class="h-9 w-9" />
			<span class="font-Leckerli-One text-xl text-violet-800">Inkclusive</span>
			<span class="hidden h-6 border-l border-violet-200 sm:block"></span>
			<span class="hidden text-sm font-semibold text-slate-500 sm:block">Admin workspace</span>
		</a>
		<div class="flex items-center gap-3">
			<div class="hidden items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 sm:flex">
				<ShieldCheck size={15} strokeWidth={2.2} /> Admin tools
			</div>
			<a href="/dashboard/editor" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800">
				<ArrowLeft size={16} /> <span class="hidden sm:inline">Return to editor</span><span class="sm:hidden">Editor</span>
			</a>
		</div>
	</div>
</header>
