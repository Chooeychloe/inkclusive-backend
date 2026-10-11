<script lang="ts">
    // ... your imports remain the same
    import { cn } from '$lib/utils';
    import { page } from '$app/stores';
    import SuggestionTab from '$lib/features/suggestion-bot/presentation/SuggestionTab.svelte';
    import * as Dialog from '$lib/components/ui/dialog';
    import { onMount } from 'svelte';
    import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
    import * as Table from '$lib/components/ui/table/index.js';
    import { tourStore } from '$lib/stores/tourStore';
    import CommandsDialog from '$lib/components/CommandsDialog.svelte';
    import HelpDialog from '$lib/components/HelpDialog.svelte';
    import InfoDialog from '$lib/components/InfoDialog.svelte';
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';
    import { FilePenLine, ScanSearch, History, Keyboard, HeartHandshake, Info } from '@lucide/svelte';
    // ... your burger and commands arrays remain the same
</script>

<div class="flex flex-1 bg-background">
    <div
        class="step-1 flex flex-col justify-between gap-2 border-r border-solid border-border bg-card sm:w-auto md:w-48 2xl:w-64"
    >
        <div class="flex flex-col gap-1 *:px-2">
            <div
                class="flex h-14 items-center justify-center gap-2 border-b border-solid border-border bg-muted/50 lg:justify-start"
            >
<img 
                    src="/inkclusive.svg" 
                    alt="Inkclusive Logo" 
                    class="h-8 w-8 ml-2 lg:ml-0" 
                />                <h1 class="hidden font-Leckerli-One text-2xl text-purple-700 lg:inline">Inkclusive</h1>
            </div>

            <div class="mb-5 hidden border-b border-dashed border-primary/25 px-3 py-2 lg:inline">
                <h3 class="text-xs font-bold uppercase tracking-wider text-primary">Features</h3>
            </div>

            <nav class="flex flex-col gap-2 *:px-2">
                <a
                    href="/write"
                    class={cn(
                        'flex items-center justify-start gap-3 rounded-xl border border-transparent p-2.5 text-lg font-medium transition-all ease-in-out',
                        'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        $page.url.pathname === '/write' &&
                            'border-purple-200 bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:text-white'
                    )}
                >
                    <span class="flex items-center justify-center rounded-lg bg-emerald-500 p-1.5 text-white shadow-sm">
                        <FilePenLine class="size-5" aria-hidden="true" />
                    </span>
                    <span class="hidden lg:inline">Write</span>
                </a>

                <a
                    href="/scan"
                    class={cn(
                        'flex items-center justify-start gap-3 rounded-xl border border-transparent p-2.5 text-lg font-medium transition-all ease-in-out',
                        'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        $page.url.pathname === '/scan' &&
                            'border-purple-200 bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:text-white'
                    )}
                >
                    <span class="flex items-center justify-center rounded-lg bg-sky-500 p-1.5 text-white shadow-sm">
                        <ScanSearch class="size-5" aria-hidden="true" />
                    </span>
                    <span class="hidden lg:inline">Scan</span>
                </a>

                <a
                    href="/history"
                    class={cn(
                        'flex items-center justify-start gap-3 rounded-xl border border-transparent p-2.5 text-lg font-medium transition-all ease-in-out',
                        'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        $page.url.pathname === '/history' &&
                            'border-purple-200 bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:text-white'
                    )}
                >
                    <span class="flex items-center justify-center rounded-lg bg-violet-500 p-1.5 text-white shadow-sm">
                        <History class="size-5" aria-hidden="true" />
                    </span>
                    <span class="hidden lg:inline">History</span>
                </a>
            </nav>
        </div>

        <div class="step-7 flex flex-col gap-1 border-t border-solid border-border bg-muted/30 p-2">
            <div class="flex justify-center lg:justify-start"><ThemeToggle /></div>
            
            <Dialog.Root>
                <Dialog.Trigger class="w-full">
                    <div class="flex items-center justify-center gap-3 rounded-lg p-2 text-purple-700 hover:bg-purple-100 lg:justify-start">
                        <span class="flex items-center justify-center rounded-lg bg-fuchsia-600 p-1 text-white">
                            <Keyboard class="size-4" aria-hidden="true" />
                        </span>
                        <span class="hidden text-sm font-semibold lg:inline">Commands</span>
                    </div>
                </Dialog.Trigger>
                <CommandsDialog/>
                </Dialog.Root>

            <Dialog.Root>
                <Dialog.Trigger class="w-full">
                    <div class="flex items-center justify-center gap-3 rounded-lg p-2 text-purple-700 hover:bg-purple-100 lg:justify-start">
                        <span class="flex items-center justify-center rounded-lg bg-amber-500 p-1 text-white shadow-sm">
                            <HeartHandshake class="size-4" aria-hidden="true" />
                        </span>
                        <span class="hidden text-sm font-semibold lg:inline">Help</span>
                    </div>
                </Dialog.Trigger>
                <HelpDialog />
                </Dialog.Root>

            <Dialog.Root>
                <Dialog.Trigger class="w-full">
                    <div class="flex items-center justify-center gap-3 rounded-lg p-2 text-purple-700 hover:bg-purple-100 lg:justify-start">
                        <span class="flex items-center justify-center rounded-lg bg-slate-500 p-1 text-white">
                            <Info class="size-4" aria-hidden="true" />
                        </span>
                        <span class="hidden text-sm font-semibold lg:inline">Info</span>
                    </div>
                </Dialog.Trigger>
                <InfoDialog />
                </Dialog.Root>
        </div>
    </div>

    <main class="flex flex-1 shrink-0 basis-0 flex-col bg-background lg:flex-row">
        <slot></slot>
        <SuggestionTab></SuggestionTab>
    </main>
</div>
