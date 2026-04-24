<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
</script>

<Dialog.Content class="sm:max-w-[425px]">
	<Dialog.Header>
		<Dialog.Title>Help & Support</Dialog.Title>
	</Dialog.Header>
	<div class="space-y-4 py-4">
		<div class="rounded-lg bg-amber-50 p-4 border border-amber-100">
			<h4 class="text-sm font-bold text-amber-900 mb-1">How it works</h4>
			<p class="text-xs text-amber-800">
				Upload or paste your text in the Editor. Our AI will highlight gendered terms and suggest inclusive alternatives.
			</p>
		</div>
		<button class="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
			View Documentation
		</button>
		<p class="text-center text-xs text-slate-400">Version 1.0.0 (Beta)</p>
	</div>
</Dialog.Content>