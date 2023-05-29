<script lang="ts">
	import { enhance } from '$app/forms';
	import { debounce } from '$lib/utils';
	import type { PageData } from './$types';

	export let data: PageData;

	type UpdateRequest = { id: number; value: string | boolean };

	const makeRequestDebounce = debounce(makeRequest, 350);

	async function makeRequest({ id, value }: UpdateRequest) {
		const response = await fetch('/api/updateTodo', {
			method: 'POST',
			body: JSON.stringify({ id, value })
		});

		if (response.status === 200) {
			await response.json();
		}
	}

	async function handleOnChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const type = target.type;
		const id = Number(target.dataset.id);
		const value = type === 'text' ? target.value : target.checked;

		makeRequestDebounce({ id, value });
	}
</script>

<h1>TODO</h1>

<form method="POST" action=".?/createTodo" use:enhance>
	<fieldset>
		<label for="task">Task</label>
		<input id="task" type="text" name="task" />
	</fieldset>

	<button type="submit">Add</button>
</form>

{#if data.todos.length}
	{#each data.todos as { id, task, completed }}
		<input
			class="completed"
			type="checkbox"
			data-id={id}
			name="completed"
			checked={completed}
			on:change={handleOnChange}
		/>
		<input
			class="task"
			type="text"
			data-id={id}
			name="task"
			value={task}
			on:input={handleOnChange}
		/>
	{/each}
{:else}
	<p>No todos yet.</p>
{/if}

<style>
	fieldset {
		border: none;
	}

	.completed:hover {
		cursor: pointer;
	}

	.task {
		border: none;
		padding: 0.25rem 0.5rem;
	}
</style>
