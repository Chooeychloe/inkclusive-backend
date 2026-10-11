<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { TformSchema } from '$lib/features/suggestion-bot/entities/formSchema';
	import { cn } from '$lib/utils';
	import * as Select from '$lib/components/ui/select/index.js';
	import { preferenceStore } from '$lib/stores/preferenceStore';
	import { onMount } from 'svelte';
	import { ArrowLeft, Brain, CircleHelp, Plus, Trash2 } from '@lucide/svelte';
	let { toPreferenceModule }: { toPreferenceModule: () => void } = $props();

	let preferences = $state<TformSchema[]>([{ name: '', pronoun: '' }]);
	// this is the shittiest implementation of a preference array in history
	// I fucking hate this implementation
	// why can't svelte watch mutations of an array
	function pronounMap(value: string) {
		switch (value) {
			case 'female':
				return 'She/Her';

			case 'male':
				return 'He/His';

			case 'gender_fair':
				return 'They/Them';

			default:
				return '';
		}
	}

	onMount(() => {
		// gets preferences
		if (localStorage.getItem('preferences')) {
			preferences = JSON.parse(localStorage.getItem('preferences') as string);
			$preferenceStore = JSON.parse(localStorage.getItem('preferences') as string);
			console.log('preferences', preferences);
			console.log('preferenceStore', $preferenceStore);
		} else {
			preferences = $preferenceStore;
		}
	});
</script>

<div class="h-full w-full">
	<!--	heading-->
	<div
		class="flex h-14 w-full items-center justify-between gap-2 border-b border-solid border-border bg-card p-3"
	>
		<div class="flex items-center justify-start gap-2">
			<Brain class="size-7 text-primary" aria-hidden="true" />
			<h2 class="text-xl text-purple-700 font-semibold">Preference</h2>
		</div>

		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<button type="button" class="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground" aria-label="About pronoun preferences">
						<CircleHelp class="size-5" aria-hidden="true" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content class="w-64">
					<p>
						If you have people with preferred pronouns, list down their names here and the AI will
						adjust accordingly.
					</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>
	<div class="flex flex-col items-start justify-center gap-2 p-3">
		<!--back-->
		<div class="mb-5 w-full">
			<button
				class="group flex items-center justify-start gap-2"
				onclick={() => toPreferenceModule()}
			>
				<ArrowLeft class="size-5 text-primary" aria-hidden="true" />
				<span class="text-base text-purple-700 group-hover:underline"> Back </span>
			</button>
		</div>
		<!--inputs -->
		<div class=" flex w-full flex-col items-center justify-center gap-3">
			{#each preferences as preference, index}
				<div class="flex items-center justify-center gap-2">
					<div class="flex w-full  text-purple-700 max-w-sm flex-col gap-1.5">
						{#if index === 0}
							<Label for="Name">Name</Label>
						{/if}
						<Input
							type="text"
							bind:value={preference.name}
							onchange={() => {
								$preferenceStore = preferences;
								localStorage.setItem('preferences', JSON.stringify($preferenceStore));
							}}
							class="focus-visible:ring-blue-500"
							id="Name"
							placeholder="Insert your name..."
						/>
					</div>
					<div class="flex w-full text-purple-700 max-w-sm flex-col gap-1.5">
						{#if index === 0}
							<Label for="Pronoun">Pronouns</Label>
						{/if}
						<Select.Root
							type="single"
							bind:value={preference.pronoun}
							onValueChange={() => {
								$preferenceStore = preferences;
								localStorage.setItem('preferences', JSON.stringify($preferenceStore));
							}}
						>
							<Select.Trigger class="focus:ring-blue-500">
								{#if preference.pronoun === ''}
									Preference
								{:else}
									{pronounMap(preference.pronoun)}
								{/if}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="male" class="text-purple-700 ">He/His</Select.Item>
								<Select.Item value="female" class="text-purple-700">She/Her</Select.Item>
								<Select.Item value="gender_fair" class="text-purple-700">They/Them</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<!--remove entry-->
					<button
						class={cn('group', index === 0 && 'mt-5')}
						aria-label="Remove preference for {preference.name || 'this person'}"
						title="Remove preference"
						onclick={() => {
							preferences.splice(index, 1);
							$preferenceStore = preferences;
							localStorage.setItem('preferences', JSON.stringify($preferenceStore));
						}}
					>
						<Trash2 class="size-5 text-muted-foreground group-hover:text-destructive" aria-hidden="true" />
					</button>
				</div>
			{/each}

			{#if preferences.length === 0}
				<p class=" text-base text-purple-700 ">No Preferences</p>
			{/if}
		</div>
		<!--add-->
		<div class="flex w-full  text-purple-700 items-center justify-center">
			<Button
				class="h-10 w-10 rounded-full"
				variant="outline"
				aria-label="Add another preference"
				title="Add another preference"
				onclick={() => {
					preferences = [...preferences, { name: '', pronoun: '' }];
					$preferenceStore = preferences;
					localStorage.setItem('preferences', JSON.stringify($preferenceStore));
					console.log(localStorage.getItem('preferences'));
				}}
			>
				<Plus class="size-5 text-primary" aria-hidden="true" /></Button
			>
		</div>
	</div>
</div>
