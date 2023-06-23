<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	$: {
		console.log('UI Register ==>', { data, form });
	}
</script>

<h1>Become a member</h1>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<form method="POST" action="?/register" use:enhance>
	<fieldset>
		<label for="name">Name</label>
		<input id="name" type="text" name="name" value={form?.name ?? ''} autocomplete="name" />
	</fieldset>
	<fieldset>
		<label for="email">Email</label>
		<input id="email" type="email" name="email" autocomplete="username" value={form?.email ?? ''} />
	</fieldset>

	<button>Submit</button>
</form>
