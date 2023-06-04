<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;

	$: {
		console.log('UI ==>', 'form', form);
	}
</script>

<h1>File upload</h1>

<form method="POSt" action="upload?/uploadFile" use:enhance>
	<label for="text">Choose a file:</label>

	<input type="file" id="text" name="files" accept="text/plain, image/jpeg" />

	<button type="submit">Submit</button>
</form>
