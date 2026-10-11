import { refreshStore } from '$lib/stores/refreshStore';
import { get } from 'svelte/store';
import type { TGenderTermProcessed } from './column';
import { toast } from 'svelte-sonner';
import { env } from '$env/dynamic/public';

// const url = import.meta.env.VITE_BACKEND_URL || 'NOTHING';
const url = env.PUBLIC_BACKEND_URL || 'NOTHING';

type TermsResponse = { [key: string]: string[] };
export type TermRecord = { term: string; options: string[]; category?: string; guidance?: string; examples?: string[] };

export async function getTermRecords(): Promise<TermRecord[]> {
	const response = await fetch(url + 'terms/records', { headers: { 'Content-Type': 'application/json' } });
	if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
	return await response.json() as TermRecord[];
}

function toPayload(request: TGenderTermProcessed): TermRecord {
	return { term: request.term.trim(), options: request.alternatives.split(',').map(x => x.trim()).filter(Boolean), category: request.category || 'Other', guidance: request.guidance || '', examples: (request.examples || '').split(';').map(x => x.trim()).filter(Boolean) };
}

export async function getList(): Promise<TermsResponse> {
	console.log(url);
	try {
		const response = await fetch(url + 'terms', {
			method: 'GET',
			headers: {
				'ngrok-skip-browser-warning': 'true',
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errorText}`);
		}

		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.includes('application/json')) {
			const text = await response.text();
			console.log(text);
			throw new Error(`Expected JSON, got: ${contentType}. Response: ${text}`);
		}

		return (await response.json()) as TermsResponse;
	} catch (error) {
		if (error instanceof SyntaxError) {
			console.error('Invalid JSON response');
		}
		throw error;
	}
}

async function postList(request: TGenderTermProcessed) {
	const response = await fetch(url + 'terms', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(toPayload(request))
	});

	if (!response.ok) {
		toast.error('Error Occured Please Check Logs');
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return response.json() as Promise<TermsResponse>;
}
export async function postBulkList(request: TGenderTermProcessed[]) {
	try {
		const response = await fetch(url + 'terms/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ terms: request.map(toPayload) }) });
		if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
		console.log('Bulk submission completed:', request.length);

		toast.success('Submission Added');
		refreshStore.set(get(refreshStore) + 1);
	} catch (error) {
		console.error('Error in bulk submission:', error);
		toast.error('Error occurred during bulk submission. Please check logs.');
	}
}

export async function putList(term: string, options: string, category = 'Other', guidance = '', examples = ''): Promise<TermsResponse> {
	const sanitizedOptions = options.split(',');
	const response = await fetch(url + 'terms/' + term, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ options: sanitizedOptions.map(x => x.trim()).filter(Boolean), category, guidance, examples: examples.split(';').map(x => x.trim()).filter(Boolean) })
	});
	if (!response.ok) {
		toast.error('Error Occured Please Check Logs');
		throw new Error(`HTTP error! status: ${response.status}`);
	} else {
		toast.success('Success');
		refreshStore.set(get(refreshStore) + 1);
	}
	console.log(sanitizedOptions);

	return response.json() as Promise<TermsResponse>;
}

export async function deleteListItem(term: string) {
	const response = await fetch(url + 'terms/' + term, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (!response.ok) {
		toast.error('Error Occured Please Check Logs');
		throw new Error(`HTTP error! status: ${response.status}`);
	} else {
		toast.success('Success');
		refreshStore.set(get(refreshStore) + 1);
	}
}

// ignore me
async function bulkDelete(term: string) {
	const response = await fetch(url + 'terms/' + term, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (!response.ok) {
		toast.error('Error Occured Please Check Logs');
		throw new Error(`HTTP error! status: ${response.status}`);
	} else {
		toast.success('Success');
		refreshStore.set(get(refreshStore) + 1);
	}
}

export async function bulkDeleteListItem(terms: string[]) {
	try {
		const results = await Promise.all(terms.map(bulkDelete));
		console.log('✅ Bulk submission results:', results);

		toast.success('✅ Submission Added');
		refreshStore.set(get(refreshStore) + 1);
	} catch (error) {
		console.error('Error in bulk submission:', error);
		toast.error('Error occurred during bulk submission. Please check logs.');
	}
}
