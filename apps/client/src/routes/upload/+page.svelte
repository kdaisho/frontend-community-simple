<script lang="ts">
	import type { ActionData } from './$types';
	import Button from '$lib/components/Button.svelte';
	import { enhance } from '$app/forms';

	export let form: ActionData;
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

<style>
	form {
		align-items: flex-start;
		display: flex;
		flex-flow: column nowrap;
		gap: 2rem;
	}
</style>
