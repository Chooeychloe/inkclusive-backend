<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	let { nextSlide }: { nextSlide: () => Promise<void> } = $props();
	import { textContent } from '$lib/stores/textFromEditorStore';
	import { ArrowRight, LoaderCircle } from '@lucide/svelte';

	let isLoading = $state(false);
	let wordCount = $derived($textContent.trim() ? $textContent.trim().split(/\s+/).length : 0);
	async function proceed() {
		isLoading = true;
		await nextSlide();
		isLoading = false;
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title class="border-b border-dashed border-stone-500 pb-2 font-bold text-purple-900"
			>Step 1: Write</Card.Title
		>
		<Card.Description role={wordCount > 600 ? 'alert' : 'status'} aria-live="polite">
			{#if wordCount > 600}
				Word limit exceeded: your text has {wordCount} words. The maximum is 600; remove
				{wordCount - 600} words to continue.
			{:else if wordCount < 26}
				Enter at least 26 words to begin ({wordCount}/600 words).
			{:else}
				{wordCount}/600 words. You can continue.
			{/if}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Button
			class="step-6 flex  w-full items-center  justify-between border border-purple-500 bg-purple-50 p-3  text-base font-bold text-purple-500 hover:bg-purple-500 hover:text-purple-50"
			disabled={wordCount <= 25 || wordCount > 600 || isLoading}
			variant="outline"
			color="secondary"
			onclick={proceed}
		>
			<p>Proceed</p>
			{#if isLoading}
				<LoaderCircle class="animate-spin" />
			{:else}
				<ArrowRight class="size-4" aria-hidden="true" />
			{/if}
		</Button>
	</Card.Content>
</Card.Root>
