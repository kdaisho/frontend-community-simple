<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { debounce } from '$lib/utils';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;
	export let form: ActionData;

	$: {
		if (form?.success) {
			invalidateAll();
		}
	}

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

	let dialog: HTMLDialogElement;

	const showDialog = () => {
		dialog.showModal();
	};

	const clickOutside = (e: MouseEvent) => {
		const rect = dialog.getBoundingClientRect();
		if (
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom
		) {
			dialog.close();
		}
	};
</script>

<div class="todo-page">
	<h1>TODO</h1>
	<p>
		<button on:click={showDialog}>Add a todo</button>
	</p>

	<dialog bind:this={dialog} on:click={clickOutside} on:keydown>
		<form method="POST" action="todo?/createTodo" use:enhance>
			<fieldset>
				<label for="task">Task</label>
				<input id="task" type="text" name="task" />
			</fieldset>

			<button type="button" on:click={() => dialog.close()}>Cancel</button>
			<button type="submit">Add</button>
		</form>
	</dialog>

	{#if data.todos.length}
		{#each data.todos as { id, task, completed }}
			<fieldset class="todo">
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
			</fieldset>
		{/each}
	{:else}
		<p>No todos yet.</p>
	{/if}
</div>

<style>
	.todo-page {
		display: flex;
		flex-flow: column nowrap;
		gap: 1rem;
	}

	.todo {
		align-items: center;
		display: flex;
		flex-flow: row nowrap;
		gap: 0.25rem;
	}

	.completed:hover {
		cursor: pointer;
	}

	.task {
		border: none;
		padding: 0.25rem 0.5rem;
	}

	dialog {
		border: none;
		border-radius: 6px;
		box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
		padding: 1rem;
	}
</style>
