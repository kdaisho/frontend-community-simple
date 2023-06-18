<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	$: {
		console.log('UI Reg ==>', { data, form });
	}
</script>

<h1>Become a member</h1>

<form
	method="POST"
	action="?/register"
	use:enhance={() =>
		({ update }) => {
			update({ reset: false });
		}}
>
	<fieldset>
		<label for="name">Name</label>
		<input id="name" type="text" name="name" autocomplete="name" />
		{#if form?.errors?.name}
			<p style="color: red">{form.errors.name}</p>
		{/if}
	</fieldset>
	<fieldset>
		<label for="email">Email</label>
		<input id="email" type="email" name="email" autocomplete="username" />
		{#if form?.errors?.email}
			<p style="color: red">{form.errors.email}</p>
		{/if}
	</fieldset>

	<button>Submit</button>
</form>
