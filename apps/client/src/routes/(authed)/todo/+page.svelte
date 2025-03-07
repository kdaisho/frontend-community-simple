<script lang="ts">
    import { enhance } from '$app/forms'
    import { invalidateAll } from '$app/navigation'
    import NeumorphismButton from '$lib/components/NeumorphismButton.svelte'
    import { debounce } from '$lib/utils'
    import { run } from 'svelte/legacy'
    import type { ActionData, PageData } from './$types'

    interface Props {
        data: PageData
        form: ActionData
    }

    let { data, form }: Props = $props()

    run(() => {
        if (form?.success) {
            invalidateAll()
        }
    })

    let dialog: HTMLDialogElement = $state()
    let input: HTMLInputElement = $state()

    function showDialog() {
        dialog.showModal()
    }

    function clickOutside(event: MouseEvent) {
        const rect = dialog.getBoundingClientRect()
        if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
        ) {
            dialog.close()
        }
    }

    type UpdateRequest = { id: string; value: string | boolean }

    async function makeRequest({ id, value }: UpdateRequest) {
        if (!value) return
        // TODO: find a way to tell user empty value is ignored

        const response = await fetch('/api/updateTodo', {
            method: 'POST',
            body: JSON.stringify({ id, value }),
        })

        if (response.status === 200) {
            await response.json()
        }
    }

    let taskUpdateInputs: HTMLInputElement[] = $state([])
    const makeRequestDebounce = debounce(makeRequest, 350)

    async function handleOnChange(event: Event) {
        const target = event.target as HTMLInputElement
        const type = target.type
        const id = target.dataset.id || ''
        const value = type === 'text' ? target.value : target.checked
        makeRequestDebounce({ id, value })
    }

    function unfocus(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            const target = event.target as HTMLInputElement
            const { index } = target.dataset
            taskUpdateInputs[Number(index)].blur()
        }
    }
</script>

<div class="todo-page">
    <header>
        <h1>TODO</h1>
        <NeumorphismButton on:click={showDialog}>+</NeumorphismButton>
    </header>

    <!-- <dialog bind:this={dialog} onclick={clickOutside} onkeydown={bubble('keydown')}> -->
    <dialog bind:this={dialog} onclick={clickOutside}>
        <form
            method="POST"
            action="todo?/createTodo"
            use:enhance={() => {
                return async ({ update }) => {
                    update()
                    setTimeout(() => input.focus(), 100)
                }
            }}
        >
            <label for="task"
                >Task
                <input
                    class="neumorphism-input"
                    id="task"
                    type="text"
                    name="task"
                    bind:this={input}
                />
            </label>

            <div class="control">
                <NeumorphismButton
                    type="button"
                    color="var(--danger)"
                    on:click={() => dialog.close()}>-</NeumorphismButton
                >
                <NeumorphismButton type="submit">+</NeumorphismButton>
            </div>
        </form>
    </dialog>

    {#if data.todos.length}
        <div class="todo-list">
            {#each data.todos as { uuid, task, isCompleted }, i}
                <fieldset class="todo">
                    <input
                        class="completed"
                        type="checkbox"
                        data-id={uuid}
                        name="completed"
                        checked={isCompleted}
                        onchange={handleOnChange}
                    />
                    <input
                        class="task"
                        type="text"
                        data-id={uuid}
                        data-index={i}
                        name="task"
                        value={task}
                        oninput={handleOnChange}
                        onkeydown={unfocus}
                        bind:this={taskUpdateInputs[i]}
                    />
                </fieldset>
            {/each}
        </div>
    {:else}
        <p>No todos yet.</p>
    {/if}
</div>

<style>
    .todo-page {
        display: flex;
        flex-flow: column nowrap;
        gap: 1.5rem;
    }

    header {
        align-items: center;
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }

    .todo-list {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.5rem;
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
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        width: 100%;
    }

    input {
        background: inherit;
    }

    input[type='text']:focus-visible {
        border-radius: var(--border-radius);
        box-shadow: inset 2px 2px 6px rgb(0 0 0 / 20%);
        outline: none;
    }

    dialog {
        background: var(--app-white);
        border: none;
        border-radius: var(--border-radius-large);
        box-shadow:
            rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
            rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
        padding: 1rem;
        width: 280px;
    }

    form {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.75rem;
    }

    form label {
        grid-area: task;
    }

    .neumorphism-input {
        border: none;
        background: var(--light-grey);
        border-radius: var(--border-radius);
        box-shadow:
            inset 2px 2px 6px #cbcbcb,
            inset -2px -2px 6px #fff;
        color: var(--app-black);
        outline: none;
        padding: 0.5rem 0.75rem;
        width: 100%;
    }

    .neumorphism-input:focus {
        background: var(--light-grey);
    }

    .control {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        gap: 1rem;
    }
</style>
