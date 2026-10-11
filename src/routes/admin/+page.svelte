<script lang="ts">
	import { cn } from '$lib/utils';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SuggestionTab from '$lib/features/suggestion-bot/presentation/SuggestionTab.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { onMount } from 'svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { AlertTriangle, BookText, FileText, HandHeart, KeyRound, ShieldCheck, Trash2 } from '@lucide/svelte';

	import {
		type SortingState,
		type PaginationState,
		type ColumnFiltersState,
		type RowSelectionState,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		getFilteredRowModel
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';

	import { Button } from '$lib/components/ui/button/index.js';
	import type { PageData } from './$types.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import AddTermForm from './AddTermForm.svelte';
	import TermLibraryTransfer from './TermLibraryTransfer.svelte';

	import AdminNavbar from './AdminNavbar.svelte';

	import { columns, type TGenderTermProcessed } from './column';
	import { bulkDeleteListItem, getTermRecords } from './service.js';
	import { listStore, refreshStore } from '$lib/stores/refreshStore.js';
	import { Toaster } from 'svelte-sonner';

	// Admin authentication state
	let showPasswordDialog = $state(true);
	let adminPassword = $state('');
	let authError = $state('');
	let isAuthenticated = $state(false);
	let isAuthLoading = $state(false);

	let burger = $state<TGenderTermProcessed[]>([]);
	let burger2 = $state<TGenderTermProcessed[]>([]);
	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});

	// Add loading state
	let isLoading = $state(true);
	let loadError = $state('');
	let totalAlternatives = $derived(
		burger.reduce((total, item) => total + item.alternatives.split(',').filter(Boolean).length, 0)
	);

	// Derived state for submit button
	let isSubmitDisabled = $derived(isAuthLoading || !adminPassword.trim());

	async function verifyAdminPassword(): Promise<void> {
		if (!adminPassword.trim()) {
			authError = 'Password is required';
			return;
		}

		isAuthLoading = true;
		authError = '';

		try {
			const response = await fetch('/api/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ password: adminPassword })
			});

			const result: { success: boolean } = await response.json();

			if (result.success) {
				isAuthenticated = true;
				showPasswordDialog = false;
			} else {
				authError = 'Invalid password';
				adminPassword = '';
			}
		} catch (err) {
			authError = 'Authentication failed. Please try again.';
		} finally {
			isAuthLoading = false;
		}
	}

	function handleAuthCancel(): void {
		goto('/'); // Redirect to home or previous page
	}

	function handleAuthKeyPress(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			verifyAdminPassword();
		}
	}

	async function loadEverything() {
		try {
			isLoading = true;
			loadError = '';
			burger = [];
			burger2 = [];
			$listStore = [];
			const records = await getTermRecords();
			for (const entry of records) burger2.push({ term: entry.term, alternatives: entry.options.join(', '), category: entry.category || 'Other', guidance: entry.guidance || '', examples: (entry.examples || []).join('; ') });

			burger = [...burger2];
			$listStore = [...burger2];
		} catch (error) {
			console.error('Error loading data:', error);
			loadError = 'We could not load the term library. Check the backend connection and try again.';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		// Only load data if authenticated
		if (isAuthenticated) {
			loadEverything();
		}
	});

	$effect(() => {
		if ($refreshStore > 0 && isAuthenticated) {
			loadEverything();
		}
	});

	// Load data when authenticated
	$effect(() => {
		if (isAuthenticated) {
			loadEverything();
		}
	});

	const table = createSvelteTable({
		get data() {
			return burger;
		},
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get rowSelection() {
				return rowSelection;
			}
		}
	});

	let { data }: { data: PageData } = $props();
	let deleteDialogOpen = $state(false);
	function openDeleteDialog() {
		deleteDialogOpen = true;
		// Keep dropdown open when dialog opens
	}

	function handleDeleteDialogClose() {
		deleteDialogOpen = false;
	}
</script>

<Toaster richColors position="top-center"></Toaster>

<!-- Admin Password Dialog -->
<AlertDialog.Root bind:open={showPasswordDialog}>
	<AlertDialog.Content class="sm:max-w-md">
		<AlertDialog.Header>
			<div class="flex items-start gap-3">
				<div class="rounded-xl bg-primary/10 p-2.5 text-primary"><ShieldCheck class="size-5" /></div>
				<div class="space-y-1">
					<AlertDialog.Title>Admin access</AlertDialog.Title>
					<AlertDialog.Description>Enter your administrator password to manage the language library.</AlertDialog.Description>
				</div>
			</div>
		</AlertDialog.Header>

		<div class="space-y-2 py-2">
			<label for="admin-password" class="text-sm font-medium">Password</label>
			<Input
				id="admin-password"
				type="password"
				placeholder="Enter your password"
				bind:value={adminPassword}
				onkeypress={handleAuthKeyPress}
				disabled={isAuthLoading}
				class="mb-2"
			/>

			{#if authError}
				<Alert variant="destructive" class="mt-2">
					<AlertTriangle class="h-4 w-4" />
					<AlertDescription>{authError}</AlertDescription>
				</Alert>
			{/if}
		</div>

		<AlertDialog.Footer class="mt-2 gap-2">
			<AlertDialog.Cancel onclick={handleAuthCancel} disabled={isAuthLoading}>
				Cancel
			</AlertDialog.Cancel>
			<AlertDialog.Action onclick={verifyAdminPassword} disabled={isSubmitDisabled} class="gap-2">
				<KeyRound class="size-4" />
				{#if isAuthLoading}
					Verifying...
				{:else}
					Access Page
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Protected Content (only shown when authenticated) -->
{#if isAuthenticated}
	<main class="min-h-[100svh] w-full bg-background text-foreground">
		{#key $listStore}
			<AdminNavbar></AdminNavbar>

			<div class="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-10">
				<div class="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
					<div>
						<div class="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
							<span class="h-1.5 w-1.5 rounded-full bg-violet-600"></span> Language resources
						</div>
						<h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Term library</h1>
						<p class="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Manage inclusive language guidance used across Inkclusive suggestions.</p>
					</div>
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<span class="h-2 w-2 rounded-full {loadError ? 'bg-rose-500' : isLoading ? 'animate-pulse bg-amber-400' : 'bg-emerald-500'}"></span>
						{loadError ? 'Connection issue' : isLoading ? 'Syncing library' : 'Library connected'}
					</div>
				</div>

				<div class="mb-6 grid gap-4 sm:grid-cols-3">
					<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
						<p class="text-sm font-medium text-muted-foreground">Inclusive terms</p>
						<div class="mt-3 flex items-end justify-between"><p class="text-3xl font-bold tracking-tight text-foreground">{isLoading ? '—' : burger.length}</p><span class="rounded-lg bg-primary/10 p-2 text-primary"><BookText class="size-5" aria-hidden="true" /></span></div>
						<p class="mt-2 text-xs text-muted-foreground">Managed in your language library</p>
					</div>
					<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
						<p class="text-sm font-medium text-muted-foreground">Alternative suggestions</p>
						<div class="mt-3 flex items-end justify-between"><p class="text-3xl font-bold tracking-tight text-foreground">{isLoading ? '—' : totalAlternatives}</p><span class="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400"><FileText class="size-5" aria-hidden="true" /></span></div>
						<p class="mt-2 text-xs text-muted-foreground">Options available across all terms</p>
					</div>
					<div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
						<p class="text-sm font-medium text-muted-foreground">Review workflow</p>
						<div class="mt-3 flex items-end justify-between"><p class="text-lg font-bold tracking-tight text-foreground">Keep it inclusive</p><span class="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400"><HandHeart class="size-5" aria-hidden="true" /></span></div>
						<p class="mt-2 text-xs text-muted-foreground">Use clear, respectful language in every entry</p>
					</div>
				</div>

				<section class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
					<div class="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
						<div>
							<h2 class="text-lg font-bold text-foreground">Managed terms</h2>
							<p class="mt-1 text-sm text-muted-foreground">Search, edit, add, or remove language suggestions.</p>
						</div>
						<div class="flex flex-col gap-2 sm:flex-row">
					<Input
						placeholder="Filter by Term..."
						value={(table.getColumn('term')?.getFilterValue() as string) ?? ''}
						onchange={(e) => {
							table.getColumn('term')?.setFilterValue(e.currentTarget.value);
						}}
						oninput={(e) => {
							table.getColumn('term')?.setFilterValue(e.currentTarget.value);
						}}
						class="w-full sm:w-64"
						disabled={isLoading}
					/>
						<AddTermForm {data}></AddTermForm>
						<TermLibraryTransfer />
						</div>
				</div>
				{#if loadError}
					<div role="alert" class="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{loadError}</div>
				{/if}
				<div class="overflow-x-auto px-5 sm:px-6">
					<Table.Root>
						<Table.Header>
							{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
								<Table.Row>
									{#each headerGroup.headers as header (header.id)}
										<Table.Head>
											{#if !header.isPlaceholder}
												<FlexRender
													content={header.column.columnDef.header}
													context={header.getContext()}
												/>
											{/if}
										</Table.Head>
									{/each}
								</Table.Row>
							{/each}
						</Table.Header>
						<Table.Body>
							{#if isLoading}
								<!-- Loading skeleton rows -->
								{#each Array(5) as _, i}
									<Table.Row>
										{#each columns as column}
												<Table.Cell class="border-t border-t-border">
												<div class="h-4 animate-pulse rounded bg-slate-100"></div>
											</Table.Cell>
										{/each}
									</Table.Row>
								{/each}
							{:else}
								{#each table.getRowModel().rows as row (row.id)}
									<Table.Row data-state={row.getIsSelected() && 'selected'}>
										{#each row.getVisibleCells() as cell (cell.id)}
										<Table.Cell class="border-t border-t-border">
												<FlexRender
													content={cell.column.columnDef.cell}
													context={cell.getContext()}
												/>
											</Table.Cell>
										{/each}
									</Table.Row>
								{:else}
									<Table.Row>
										<Table.Cell colspan={columns.length} class="h-24 text-center"
											>No results.</Table.Cell
										>
									</Table.Row>
								{/each}
							{/if}
						</Table.Body>
					</Table.Root>
					<div class="flex flex-col items-start justify-between gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:px-6">
						<div class="flex flex-1 items-center justify-between gap-2">
							<Button
								size="sm"
								variant="destructive"
								onclick={openDeleteDialog}
								disabled={isLoading || table.getSelectedRowModel().rows.length == 0}
								>Delete Selected Row(s)</Button
							>
							<div class="flex-1 text-sm text-muted-foreground">
								{#if isLoading}
									Loading...
								{:else}
									{table.getFilteredSelectedRowModel().rows.length} of{' '}
									{table.getFilteredRowModel().rows.length} row(s) selected.
								{/if}
							</div>
						</div>
						<div class="flex items-center justify-center gap-2">
							<p class="text-sm text-muted-foreground">
								{#if isLoading}
									Loading...
								{:else}
									page {table.getState().pagination.pageIndex + 1} out of {table.getPageCount()}
								{/if}
							</p>
							<Button
								variant="outline"
								size="sm"
								onclick={() => table.previousPage()}
								disabled={isLoading || !table.getCanPreviousPage()}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => table.nextPage()}
								disabled={isLoading || !table.getCanNextPage()}
							>
								Next
							</Button>
						</div>
					</div>
				</div>
				</section>
			</div>

			<Dialog.Root bind:open={deleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
				<Dialog.Content class="sm:max-w-md">
					<Dialog.Header>
						<div class="flex items-start gap-3">
							<div class="rounded-full bg-destructive/10 p-2 text-destructive"><AlertTriangle class="size-5" /></div>
							<div class="space-y-1"><Dialog.Title>Delete selected terms?</Dialog.Title>
								<Dialog.Description>This permanently removes {table.getSelectedRowModel().rows.length} selected terms and their alternatives from the library.</Dialog.Description>
							</div>
						</div>
					</Dialog.Header>
					<Dialog.Footer class="mt-2 gap-2">
						<Button
							variant="destructive"
							onclick={() => {
								const selectedRowsData = table
									.getSelectedRowModel()
									.rows.map((row) => row.original);
								const selectedTerms = selectedRowsData.map((data) => data.term);
								bulkDeleteListItem(selectedTerms);
								table.resetRowSelection(true);
								deleteDialogOpen = false;
							}}><Trash2 class="mr-2 size-4" />Delete selected</Button
						>
						<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Cancel</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/key}
	</main>
{/if}
