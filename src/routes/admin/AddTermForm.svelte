<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import { type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema } from './schema';
	import { postBulkList } from './service';
	import { Plus, Tags, Trash2, Upload } from '@lucide/svelte';

	interface Props {
		data: {
			form: SuperValidated<{ term: string; alternatives: string }>;
		};
	}

	let { data }: Props = $props();

	// Control dialog open/close state
	let dialogOpen = $state(false);

	let submittedEntries: Array<{ term: string; alternatives: string }> = $state([]);

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		// Handle client-side only, don't submit to server
		SPA: true,
		onUpdated: ({ form }) => {
			if (form.valid) {
				console.log('Form submitted successfully!');
				// Add the submitted data to our array
				submittedEntries.push({
					term: form.data.term,
					alternatives: form.data.alternatives
				});
				// Reset the form after successful submission
				form.data.term = '';
				form.data.alternatives = '';
				// Close the dialog after successful submission
				// dialogOpen = false;
			}
		}
	});
	const handleDialogClose = () => {
		dialogOpen = false;
		submittedEntries = [];
		// Reset form data to initial state
		reset();
	};

	const { form: formData, enhance, reset } = form;
</script>

<Dialog.Root open={dialogOpen} onOpenChange={handleDialogClose}>
	<Button variant="outline" class="gap-2" onclick={() => (dialogOpen = true)}><Plus class="size-4" />Add term</Button>
	<Dialog.Content class="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
		<Dialog.Header class="border-b border-border px-6 py-5">
			<div class="flex items-start gap-3">
				<div class="rounded-xl bg-primary/10 p-2.5 text-primary"><Tags class="size-5" /></div>
				<div class="space-y-1">
					<Dialog.Title>Add language terms</Dialog.Title>
					<Dialog.Description>Add a gender-neutral term and its alternatives to the shared library.</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>
		<form method="POST" use:enhance class="min-h-0 space-y-5 overflow-y-auto px-6 py-5">
			<Form.Field {form} name="term">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Inclusive term</Form.Label>
						<Input style="text-transform: lowercase;" placeholder="e.g. spokesperson" {...props} bind:value={$formData.term} />
					{/snippet}
				</Form.Control>
				<Form.Description>The term people should use instead.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="alternatives">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Alternatives</Form.Label>
						<Input style="text-transform: lowercase;" placeholder="Separate alternatives with commas" {...props} bind:value={$formData.alternatives} />
					{/snippet}
				</Form.Control>
				<Form.Description>Add one or more alternatives, separated by commas.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer class="border-t border-border pt-4">
				<Form.Button class="w-full gap-2 sm:w-auto"><Plus class="size-4" />Add to batch</Form.Button>
			</Dialog.Footer>
		</form>

		{#if submittedEntries.length > 0}
			<div class="space-y-3 border-t border-border bg-muted/30 px-6 py-4">
				<div class="flex items-center justify-between gap-2">
					<h4 class="font-semibold">Ready to add</h4>
					<span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{submittedEntries.length} {submittedEntries.length === 1 ? 'term' : 'terms'}</span>
				</div>
				<ul class="max-h-36 space-y-2 overflow-y-auto">
					{#each submittedEntries as entry, index}
						<li class="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3">
							<div class="min-w-0 space-y-1 text-sm">
								<p class="font-semibold">{entry.term}</p>
								<p class="break-words text-muted-foreground">{entry.alternatives}</p>
							</div>
							<Button variant="ghost" size="icon" class="size-8 shrink-0 text-destructive hover:text-destructive" aria-label="Remove {entry.term}" title="Remove term" onclick={() => submittedEntries.splice(index, 1)}><Trash2 class="size-4" /></Button>
						</li>
					{/each}
				</ul>
				<Button class="w-full gap-2" onclick={() => { postBulkList(submittedEntries); dialogOpen = false; }}><Upload class="size-4" />Add terms to library</Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
