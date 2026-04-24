<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	
	const commands = [
		{ key: 'Ctrl + S', desc: 'Scan current document' },
		{ key: 'Ctrl + E', desc: 'Open Editor' },
		{ key: 'Ctrl + H', desc: 'View History' },
		{ key: 'Ctrl + K', desc: 'Open Command Palette' }
	];
</script>

<Dialog.Content class="sm:max-w-[425px]">
	<Dialog.Header>
		<Dialog.Title>Keyboard Commands</Dialog.Title>
		<Dialog.Description>Quickly navigate Inkclusive using these shortcuts.</Dialog.Description>
	</Dialog.Header>
	<div class="grid gap-4 py-4">
		{#each commands as cmd}
			<div class="flex items-center justify-between border-b border-purple-50 pb-2">
				<span class="text-sm font-medium text-slate-600">{cmd.desc}</span>
				<kbd class="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-purple-700 border border-slate-300">
					{cmd.key}
				</kbd>
			</div>
		{/each}
	</div>
</Dialog.Content>