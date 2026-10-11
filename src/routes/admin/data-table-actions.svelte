<script lang="ts">
	import { Ellipsis, Pencil, Save, Trash2, TriangleAlert } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { TGenderTermProcessed } from './column';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import { deleteListItem, putList } from './service';

	let { term, index }: { term: TGenderTermProcessed; index: number } = $props();

	// State to control dropdown visibility
	let dropdownOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	let optionsResponse = $state('');
	// Function to handle dialog open while keeping dropdown open
	function openEditDialog() {
		editDialogOpen = true;
		// Keep dropdown open when dialog opens
		dropdownOpen = true;
	}

	function openDeleteDialog() {
		deleteDialogOpen = true;
		// Keep dropdown open when dialog opens
		dropdownOpen = true;
	}

	// Close dropdown when dialogs close
	function handleEditDialogClose() {
		editDialogOpen = false;
		dropdownOpen = false;
	}

	function handleDeleteDialogClose() {
		deleteDialogOpen = false;
		dropdownOpen = false;
	}

	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		optionsResponse = target.value;
	}
</script>

<DropdownMenu.Root bind:open={dropdownOpen}>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>

			<!-- Edit Dialog -->
			<DropdownMenu.Item
				onSelect={(e) => {
					e.preventDefault();
					openEditDialog();
				}}
			>
				<Pencil class="mr-2 size-4" />Edit term
			</DropdownMenu.Item>

			<!-- Delete Dialog -->
			<DropdownMenu.Item
				onSelect={(e) => {
					e.preventDefault();
					openDeleteDialog();
				}}
			>
				<Trash2 class="mr-2 size-4" />Delete term
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Edit Dialog (outside dropdown) -->
<Dialog.Root bind:open={editDialogOpen} onOpenChange={handleEditDialogClose}>
	<Dialog.Content class="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-lg">
		<Dialog.Header class="border-b border-border px-6 py-5">
			<Dialog.Title>Edit term</Dialog.Title>
			<Dialog.Description>Update the alternatives suggested for <strong>{term.term}</strong>.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-2 px-6 py-5">
			<div class="grid gap-2">
				<Label for="term-alternatives">Alternatives</Label>
				<Input
					style="text-transform: lowercase;"
					id="term-alternatives"
					value={term.alternatives}
					onchange={(e: Event) => handleChange(e)}
					class="w-full"
				/>
			</div>
			<p class="text-sm leading-5 text-muted-foreground">Separate multiple alternatives with commas.</p>
		</div>
		<Dialog.Footer class="border-t border-border bg-muted/30 px-6 py-4">
			<Button
				type="submit"
				disabled={false}
				onclick={async () => {
					await putList(term.term, optionsResponse);
				}}><Save class="mr-2 size-4" />Save changes</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Dialog (outside dropdown) -->
<Dialog.Root bind:open={deleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<div class="flex items-start gap-3">
				<div class="rounded-full bg-destructive/10 p-2 text-destructive"><TriangleAlert class="size-5" /></div>
				<div class="space-y-1"><Dialog.Title>Delete this term?</Dialog.Title>
			<Dialog.Description>
				This permanently removes <strong>{term.term}</strong> and its alternatives from the library.
			</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>
		<Dialog.Footer class="mt-2 gap-2">
			<Button
				variant="destructive"
				onclick={() => {
					deleteDialogOpen = false;
					deleteListItem(term.term);
				}}><Trash2 class="mr-2 size-4" />Delete term</Button
			>
			<Button
				variant="outline"
				onclick={() => {
					deleteDialogOpen = false;
				}}>Cancel</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
