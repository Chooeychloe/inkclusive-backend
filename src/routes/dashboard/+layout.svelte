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
    // ... your burger and commands arrays remain the same
</script>

<div class="flex flex-1 bg-purple-50/30">
    <div
        class="step-1 flex flex-col justify-between gap-2 border-r border-solid border-purple-100 bg-white sm:w-auto md:w-48 2xl:w-64"
    >
        <div class="flex flex-col gap-1 *:px-2">
            <div
                class="flex h-14 items-center justify-center gap-2 border-b border-solid border-purple-100 bg-purple-50/50 lg:justify-start"
            >
<img 
                    src="/inkclusive.svg" 
                    alt="Inkclusive Logo" 
                    class="h-8 w-8 ml-2 lg:ml-0" 
                />                <h1 class="hidden font-Leckerli-One text-2xl text-purple-700 lg:inline">Inkclusive</h1>
            </div>

            <div class="mb-5 hidden border-b border-dashed border-purple-200 px-3 py-2 lg:inline">
                <h3 class="text-xs font-bold uppercase tracking-wider text-purple-600">Features</h3>
            </div>

            <nav class="flex flex-col gap-2 *:px-2">
                <a
                    href="/dashboard/editor"
                    class={cn(
                        'flex items-center justify-start gap-3 rounded-xl border border-transparent p-2.5 text-lg font-medium transition-all ease-in-out',
                        'hover:bg-purple-100 hover:text-purple-700 text-slate-600',
                        $page.url.pathname === '/dashboard/editor' &&
                            'border-purple-200 bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:text-white'
                    )}
                >
                    <span class="flex items-center justify-center rounded-lg bg-emerald-500 p-1.5 text-white shadow-sm">
                        <span class="material-symbols-outlined s24">edit_document</span>
                    </span>
                    <span class="hidden lg:inline">Editor</span>
                </a>

                <a
                    href="/dashboard/scan"
                    class={cn(
                        'flex items-center justify-start gap-3 rounded-xl border border-transparent p-2.5 text-lg font-medium transition-all ease-in-out',
                        'hover:bg-purple-100 hover:text-purple-700 text-slate-600',
                        $page.url.pathname === '/dashboard/scan' &&
                            'border-purple-200 bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:text-white'
                    )}
                >
                    <span class="flex items-center justify-center rounded-lg bg-sky-500 p-1.5 text-white shadow-sm">
                        <span class="material-symbols-outlined s24">scan</span>
                    </span>
                    <span class="hidden lg:inline">Scan</span>
                </a>

                <a
                    href="/dashboard/history"
                    class={cn(
                        'flex items-center justify-start gap-3 rounded-xl border border-transparent p-2.5 text-lg font-medium transition-all ease-in-out',
                        'hover:bg-purple-100 hover:text-purple-700 text-slate-600',
                        $page.url.pathname === '/dashboard/history' &&
                            'border-purple-200 bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:text-white'
                    )}
                >
                    <span class="flex items-center justify-center rounded-lg bg-violet-500 p-1.5 text-white shadow-sm">
                        <span class="material-symbols-outlined s24">schedule</span>
                    </span>
                    <span class="hidden lg:inline">History</span>
                </a>
            </nav>
        </div>

        <div class="step-7 flex flex-col gap-1 border-t border-solid border-purple-100 bg-purple-50/30 p-2">
            
            <Dialog.Root>
                <Dialog.Trigger class="w-full">
                    <div class="flex items-center justify-center gap-3 rounded-lg p-2 text-purple-700 hover:bg-purple-100 lg:justify-start">
                        <span class="flex items-center justify-center rounded-lg bg-fuchsia-600 p-1 text-white">
                            <span class="material-symbols-outlined s20">keyboard_command_key</span>
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
                            <span class="material-symbols-outlined s20">volunteer_activism</span>
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
                            <span class="material-symbols-outlined s20">info</span>
                        </span>
                        <span class="hidden text-sm font-semibold lg:inline">Info</span>
                    </div>
                </Dialog.Trigger>
                <InfoDialog />
                </Dialog.Root>
        </div>
    </div>

    <main class="flex flex-1 shrink-0 basis-0 flex-col bg-slate-100 lg:flex-row">
        <slot></slot>
        <SuggestionTab></SuggestionTab>
    </main>
</div>