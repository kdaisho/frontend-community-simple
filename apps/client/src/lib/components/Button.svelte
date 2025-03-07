<script lang="ts">
    import { createBubbler } from 'svelte/legacy'

    const bubble = createBubbler()
    interface Props {
        type?: 'button' | 'submit' | 'reset'
        bg?: null | 'yellow' | 'red'
        children?: import('svelte').Snippet
    }

    let { type = 'button', bg = null, children }: Props = $props()
</script>

<button {type} onclick={bubble('click')} class={bg}>
    {#if children}
        me
        <!-- {@render children()} -->
    {:else}
        slot is required
    {/if}
</button>

<style>
    button {
        background: var(--blue);
        border-radius: var(--border-radius);
        color: var(--app-white);
        cursor: pointer;
        font-size: var(--font-medium);
        height: 40px;
        min-width: 50px;
        padding: 0.25rem 1rem;
        transition: background 0.2s ease-in;
        white-space: nowrap;
    }

    button:hover {
        background: var(--blue-darker);
    }

    button.yellow {
        background: var(--yellow);
        color: var(--app-black);
    }

    button.red {
        background: var(--red);
    }
</style>
