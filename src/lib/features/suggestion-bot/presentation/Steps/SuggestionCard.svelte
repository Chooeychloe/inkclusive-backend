<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import type { TSuggestion } from '$lib/features/suggestion-bot/entities/suggestions';
	import { revisedTextStore } from '$lib/stores/revisedTextStore';
	import { aiSuggestions } from '$lib/stores/lintingStore';
	import { progressStore } from '$lib/stores/progressStore';
	import { toast } from 'svelte-sonner';
	import { textContent } from '$lib/stores/textFromEditorStore';
	import { getSavedPronounPreferenceMap } from '$lib/features/suggestion-bot/entities/formSchema';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import { GLFScore } from '$lib/stores/omegaLOL';
	import { ignoreGrammarStore } from '$lib/stores/ignoreStore';
	import { waitStore } from '$lib/stores/waitStore';
	import { getCount } from '../../services/countService';
	import { countStore } from '$lib/stores/countStore';
	import { ChevronDown, ChevronUp, Trash2 } from '@lucide/svelte';
	const apiUrl = `${env.PUBLIC_BACKEND_URL?.replace(/\/+$/, '') ?? ''}/api/v1/`;

	let isCompact = $state<boolean>(false);
	let {
		suggestion,
		removeMe,
		index,
		ignoreMe
	}: {
		suggestion: TSuggestion;
		removeMe: (index: number, correctionString: string) => void;
		index: number;
		ignoreMe: (index: number, ignoreString: string) => void;
	} = $props();

	let isLoading = $state<boolean>(false);
	onMount(() => {
		$inspect('card', suggestion);
	});
	async function jempoyMoves(bruh: string) {
		isLoading = true;
		$waitStore = true;
		if (bruh == 'grammar') {
			try {
				const post = await fetch(`${apiUrl}grammar`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ prompt: $textContent })
				});

				if (!post.ok) {
					const error = await post.json().catch(() => ({}));
					throw new Error(error.detail || `Grammar check failed (${post.status}).`);
				}
				const data = await post.json();
				$revisedTextStore = await (data.revised_text as string);
				console.log('FETCHING ' + $textContent);
				console.log(data);

				if (Object.keys(data).length !== 0) {
					const suggestions: Promise<TSuggestion[]> = data.corrections.map(
						(correction: {
							word_index: number;
							character_offset: number;
							character_endset: number;
							original_text: string;
							message: string;
							replacements: string[];
							category?: string;
							rule_id?: string;
							examples?: string[];
						}) => ({
							indexReplacement: correction.word_index,
							originalText: correction.original_text,
							offSet: correction.character_offset,
							endSet: correction.character_endset,
							replacements: [...correction.replacements],
							correctionType: 'grammar',
							chosenReplacement: '',
							message: correction.message,
							rationale: correction.message,
							category: correction.category,
							ruleId: correction.rule_id
						})
					);
					const filteredSuggestions = await (
						await suggestions
					).filter((value) => !$ignoreGrammarStore.includes(value.originalText));
					aiSuggestions.set(await filteredSuggestions);
					$progressStore = 50;
				} else {
					progressStore.set(50);
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'The grammar service could not be reached.');
				console.error('Error:', error);
			} finally {
				isLoading = false;
				$waitStore = false;
			}
		} else if (bruh == 'gfl') {
			const preferenceMap = getSavedPronounPreferenceMap();

			try {
				const post = await fetch(`${apiUrl}gfl`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ prompt: $textContent, pronoun_map: preferenceMap })
				});

				if (!post.ok) {
					const error = await post.json().catch(() => ({}));
					throw new Error(error.detail || `Gender-fair check failed (${post.status}).`);
				}
				const data = await post.json();

				$revisedTextStore = await (data.revised_text as string);

				if (Object.keys(data).length !== 0) {
					let suggestions: Promise<TSuggestion[]> = data.corrections.map(
						(correction: {
							word_index: number;
							character_offset: number;
							character_endset: number;
							original_text: string;
							message: string;
							replacements: string[] | string;
							rationale?: string;
							category?: string;
							rule_id?: string;
							examples?: string[];
						}) => ({
							indexReplacement: correction.word_index,
							originalText: correction.original_text,
							offSet: correction.character_offset,
							endSet: correction.character_endset,
							replacements: Array.isArray(correction.replacements) ? correction.replacements : [correction.replacements],
							correctionType: 'gfl',
							chosenReplacement: '',
							message: correction.message || 'Consider a gender-neutral alternative',
							rationale: correction.rationale || '',
							category: correction.category || 'Gender-fair language',
							ruleId: correction.rule_id,
							examples: correction.examples
						})
					);

					$aiSuggestions = await suggestions;
					console.log($aiSuggestions);
				} else {
					$aiSuggestions = [];
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'The gender-fair service could not be reached.');
				console.error('Error:', error);
			} finally {
				isLoading = false;
				$waitStore = false;
			}
			await getCount();
		}
	}
</script>

<Card.Root class="my-2">
	{#if !isCompact}
		<Card.Header class="px-3 py-2">
			<Card.Title
				class="flex items-start justify-between gap-2 border-b border-dashed border-stone-500 pb-2 text-base"
			>
				<div class="min-w-0 flex-1 text-left">
					{suggestion.message}
				</div>

				<button
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
					aria-label="Collapse suggestion"
					title="Collapse suggestion"
					onclick={() => (isCompact = true)}
				>
					<ChevronUp class="size-4" aria-hidden="true" /></button
				>
			</Card.Title>
		</Card.Header>
		<Card.Content class="px-2 pb-0 pt-2">
			<p class="text-sm">
				<span class="font-bold text-red-500">Original:&nbsp;</span>
				{suggestion.originalText}
			</p>
			{#if (suggestion.rationale && suggestion.rationale !== suggestion.message) || suggestion.examples?.length || suggestion.correctionType === 'gfl'}
				<div class="my-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
					<p class="font-semibold text-foreground">Why this suggestion</p>
					{#if suggestion.rationale && suggestion.rationale !== suggestion.message}<p class="mt-1 leading-5 text-muted-foreground">{suggestion.rationale}</p>{/if}
					{#if suggestion.correctionType === 'gfl'}<p class="mt-2 text-xs font-medium text-muted-foreground">Gender-fair language</p>{/if}
					{#if suggestion.examples?.length}<p class="mt-2 text-xs text-muted-foreground">Examples: {suggestion.examples.join(' · ')}</p>{/if}
				</div>
			{/if}
			<p class="my-3 text-sm">
				<span class="font-bold text-blue-500">Revision:&nbsp;</span>
			</p>
			<div class="flex w-full flex-col gap-1">
				{#each suggestion.replacements as item}
					<button
						aria-label={`Replace ${suggestion.originalText} with ${item}`}
						disabled={$waitStore}
						class={cn(
							'group flex w-full items-center justify-center rounded-[9px] border border-solid p-[1px]',
							suggestion.correctionType === 'grammar' &&
								'border-blue-500 bg-gradient-to-t from-indigo-700 to-blue-300 p-[1px] transition-all ease-in-out hover:border-sky-500 hover:from-blue-500 hover:to-sky-200 disabled:border-sky-500 disabled:from-blue-500 disabled:to-sky-200',
							suggestion.correctionType === 'spelling' &&
								'border-red-500 bg-gradient-to-t from-rose-700 to-red-300 p-[1px] transition-all ease-in-out hover:border-red-700 hover:from-red-700 hover:to-red-200',
							suggestion.correctionType === 'gfl' &&
								'border-violet-500 bg-gradient-to-t from-purple-700 to-violet-300 p-[1px] transition-all ease-in-out hover:border-violet-700 hover:from-violet-700 hover:to-violet-200 disabled:from-purple-300 disabled:to-violet-100'
						)}
						onclick={async () => {
							if (suggestion.correctionType === 'gfl') {
								$GLFScore += 1;
							}
							await removeMe(index, item);
							await jempoyMoves(suggestion.correctionType);
						}}
					>
						<span
							class={cn(
								'w-full rounded-[8px] bg-gradient-to-t p-1 text-base font-bold transition-all ease-in-out',
								suggestion.correctionType === 'grammar' &&
									'from-indigo-700 to-blue-500  text-blue-50 hover:bg-sky-300 hover:from-blue-500 hover:text-sky-100 group-disabled:bg-sky-300 group-disabled:from-blue-500 group-disabled:text-sky-100',
								suggestion.correctionType === 'spelling' &&
									'w-full from-rose-700 to-red-500  text-red-50 hover:bg-red-200 hover:from-red-500 hover:to-red-400  hover:text-red-50',
								suggestion.correctionType === 'gfl' &&
									'w-full from-purple-700 to-violet-500  text-violet-50 hover:bg-violet-200 hover:from-violet-500 hover:to-violet-400  hover:text-violet-50 group-disabled:bg-violet-200 group-disabled:from-violet-500 group-disabled:to-violet-400  group-disabled:text-violet-50'
							)}
						>
							{item}
						</span>
					</button>
				{/each}
			</div>
		</Card.Content>
		<Card.Footer class="flex flex-col items-center justify-start gap-2 p-3 py-2">
			<Button
				variant="outline"
				size="sm"
				class="w-full text-base font-bold text-muted-foreground "
				disabled={isLoading}
				onclick={() => {
					if (suggestion.correctionType === 'gfl') {
						$GLFScore += 1;
					}
					ignoreMe(index, suggestion.originalText);
				}}>Ignore</Button
			>
		</Card.Footer>
	{:else}
		<!-- compact vers -->
		<Card.Content class="flex items-center justify-between px-3 py-2">
			<div
				class={cn(
					'h-[10px] w-[10px] rounded-full',
					suggestion.correctionType === 'grammar' && 'bg-blue-500',
					suggestion.correctionType === 'spelling' && 'bg-red-500',
					suggestion.correctionType === 'gfl' && 'bg-violet-500'
				)}
			>
				&nbsp;
			</div>

			<p class="inline w-[120px] truncate text-start text-sm">
				{suggestion.message}
			</p>

			<div class="flex items-center justify-center gap-1">
				<button
					class="inline-flex size-8 items-center justify-center rounded-full border border-destructive text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
					aria-label="Ignore suggestion"
					title="Ignore suggestion"
					disabled={isLoading}
					onclick={() => {
						if (suggestion.correctionType === 'gfl') {
							$GLFScore += 1;
						}
						ignoreMe(index, suggestion.originalText);
					}}><Trash2 class="size-4" aria-hidden="true" /></button
				>
				<button
					class="inline-flex size-8 items-center justify-center rounded-full border border-border bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
					aria-label="Expand suggestion"
					title="Expand suggestion"
					onclick={() => (isCompact = false)}
					><ChevronDown class="size-4" aria-hidden="true" />
				</button>
			</div>
		</Card.Content>
	{/if}
</Card.Root>
