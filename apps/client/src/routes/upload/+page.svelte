<script lang="ts">
	import type { ActionData } from './$types';
	import Button from '$lib/components/Button.svelte';
	import { enhance } from '$app/forms';

	export let form: ActionData;

	let filename: string;
</script>

<h1>File upload</h1>

<form method="POSt" action="upload?/uploadFile" use:enhance>
	<fieldset>
		<label for="file">Choose a file:</label>
		<input type="file" id="file" name="files" accept="text/plain, image/jpeg" />
	</fieldset>

	<Button type="submit">Submit</Button>

	{#if form?.message}
		<output>{form?.message}</output>
	{/if}
</form>

<form method="POSt" action="upload?/downloadFile" use:enhance>
	<fieldset>
		<label for="filename">File name</label>
		<input type="text" id="filename" name="filename" bind:value={filename} />
	</fieldset>

	<Button type="submit">Download</Button>
	{#if filename}
		<span>Name: {filename}</span>
		<a href="/download/{filename}" target="_blank" rel="noreferrer">Download</a>
	{/if}
</form>

<style>
	form {
		align-items: flex-start;
		display: flex;
		flex-flow: column nowrap;
		gap: 2rem;
	}
</style>
