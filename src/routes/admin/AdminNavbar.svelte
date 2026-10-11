<script lang="ts">
	import { ArrowLeft, ShieldCheck } from '@lucide/svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
</script>

<header class="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
	<div class="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between px-4 sm:px-8">
		<a href="/write" class="group flex items-center gap-3" aria-label="Back to Inkclusive editor">
			<img src="/inkclusive.svg" alt="" class="h-9 w-9" />
			<span class="font-Leckerli-One text-xl text-primary">Inkclusive</span>
			<span class="hidden h-6 border-l border-border sm:block"></span>
			<span class="hidden text-sm font-semibold text-muted-foreground sm:block">Admin workspace</span>
		</a>
		<div class="flex items-center gap-3">
			<ThemeToggle />
			<div class="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:flex">
				<ShieldCheck size={15} strokeWidth={2.2} /> Admin tools
			</div>
			<a href="/write" class="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-accent hover:text-accent-foreground">
				<ArrowLeft size={16} /> <span class="hidden sm:inline">Return to editor</span><span class="sm:hidden">Editor</span>
			</a>
		</div>
	</div>
</header>
