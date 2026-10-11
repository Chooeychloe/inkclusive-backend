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
	import { AlertTriangle } from '@lucide/svelte';

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

	import AdminNavbar from './AdminNavbar.svelte';

	import { columns, type TGenderTermProcessed } from './column';
	import { bulkDeleteListItem, getList } from './service.js';
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
	const deletedRowSelection = $state<string[]>([]);

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
			const list = await getList();
			if (!list) return;

			for (const [key, value] of Object.entries(list)) {
				burger2.push({ term: key, alternatives: value.toLocaleString() });
			}

			burger = [...burger2];
			$listStore = [...burger2];
			console.log($listStore);
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
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title class="flex items-center gap-2">
				<AlertTriangle class="h-5 w-5 text-amber-500" />
				Admin Access Required
			</AlertDialog.Title>
			<AlertDialog.Description>
				This page requires administrator privileges. Please enter the admin password to continue.
			</AlertDialog.Description>
		</AlertDialog.Header>

		<div class="py-4">
			<Input
				type="password"
				placeholder="Enter admin password"
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

		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={handleAuthCancel} disabled={isAuthLoading}>
				Cancel
			</AlertDialog.Cancel>
			<AlertDialog.Action onclick={verifyAdminPassword} disabled={isSubmitDisabled}>
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
	<main class="min-h-[100svh] w-full bg-[#f7f7fc] text-slate-900">
		{#key $listStore}
			<AdminNavbar></AdminNavbar>

			<div class="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-10">
				<div class="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
					<div>
						<div class="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-800">
							<span class="h-1.5 w-1.5 rounded-full bg-violet-600"></span> Language resources
						</div>
						<h1 class="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Term library</h1>
						<p class="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Manage inclusive language guidance used across Inkclusive suggestions.</p>
					</div>
					<div class="flex items-center gap-2 text-sm text-slate-500">
						<span class="h-2 w-2 rounded-full {loadError ? 'bg-rose-500' : isLoading ? 'animate-pulse bg-amber-400' : 'bg-emerald-500'}"></span>
						{loadError ? 'Connection issue' : isLoading ? 'Syncing library' : 'Library connected'}
					</div>
				</div>

				<div class="mb-6 grid gap-4 sm:grid-cols-3">
					<div class="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-950/[0.025]">
						<p class="text-sm font-medium text-slate-500">Inclusive terms</p>
						<div class="mt-3 flex items-end justify-between"><p class="text-3xl font-bold tracking-tight text-slate-950">{isLoading ? '—' : burger.length}</p><span class="rounded-lg bg-violet-50 p-2 text-violet-700"><span class="material-symbols-outlined s24">dictionary</span></span></div>
						<p class="mt-2 text-xs text-slate-400">Managed in your language library</p>
					</div>
					<div class="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/[0.025]">
						<p class="text-sm font-medium text-slate-500">Alternative suggestions</p>
						<div class="mt-3 flex items-end justify-between"><p class="text-3xl font-bold tracking-tight text-slate-950">{isLoading ? '—' : totalAlternatives}</p><span class="rounded-lg bg-emerald-50 p-2 text-emerald-700"><span class="material-symbols-outlined s24">forum</span></span></div>
						<p class="mt-2 text-xs text-slate-400">Options available across all terms</p>
					</div>
					<div class="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm shadow-amber-950/[0.025]">
						<p class="text-sm font-medium text-slate-500">Review workflow</p>
						<div class="mt-3 flex items-end justify-between"><p class="text-lg font-bold tracking-tight text-slate-950">Keep it inclusive</p><span class="rounded-lg bg-amber-50 p-2 text-amber-700"><span class="material-symbols-outlined s24">volunteer_activism</span></span></div>
						<p class="mt-2 text-xs text-slate-400">Use clear, respectful language in every entry</p>
					</div>
				</div>

				<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.025]">
					<div class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
						<div>
							<h2 class="text-lg font-bold text-slate-900">Managed terms</h2>
							<p class="mt-1 text-sm text-slate-500">Search, edit, add, or remove language suggestions.</p>
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
											<Table.Cell class="border-t border-t-slate-100">
												<div class="h-4 animate-pulse rounded bg-slate-100"></div>
											</Table.Cell>
										{/each}
									</Table.Row>
								{/each}
							{:else}
								{#each table.getRowModel().rows as row (row.id)}
									<Table.Row data-state={row.getIsSelected() && 'selected'}>
										{#each row.getVisibleCells() as cell (cell.id)}
										<Table.Cell class="border-t border-t-slate-100">
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
					<div class="flex flex-col items-start justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
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
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Are you absolutely sure?</Dialog.Title>
						<Dialog.Description>
							This action cannot be undone. This will permanently delete {table.getFilteredSelectedRowModel()
								.rows.length} term/s and their alternative/s.
						</Dialog.Description>
					</Dialog.Header>
					<Dialog.Footer>
						<Button
							variant="destructive"
							onclick={() => {
								const selectedRowsData = table
									.getSelectedRowModel()
									.rows.map((row) => row.original);
								selectedRowsData.forEach((data) => {
									deletedRowSelection.push(data.term);
								});
								bulkDeleteListItem(deletedRowSelection);
								table.resetRowSelection(true);
								deleteDialogOpen = false;
							}}>Delete</Button
						>
						<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Cancel</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/key}
	</main>
{/if}
