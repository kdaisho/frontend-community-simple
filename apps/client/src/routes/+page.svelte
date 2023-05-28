<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;

	console.log('data UI ==>', data);

	function debounce(
		fn: (req: { id: number; task: string; completed: boolean }) => void,
		interval: number
	) {
		let timeoutId: ReturnType<typeof setTimeout>;

		return (request) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			timeoutId = setTimeout(() => {
				fn(request);
			}, interval);
		};
	}

	// const d = debounce(handleUpdate, 500);

	async function handleOnChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const type = target.type;
		const id = Number(target.dataset.id);
		const value = type === 'text' ? target.value : target.checked;

		const response = await fetch('/api/updateTodo', {
			method: 'POST',
			body: JSON.stringify({ id, value })
		});

		if (response.status === 200) {
			await response.json();
		}
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
