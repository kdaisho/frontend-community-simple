<script lang="ts">
    interface Props {
        type?: 'button' | 'submit' | 'reset'
        bg?: null | 'yellow' | 'red'
        children?: import('svelte').Snippet
        onclick?: () => void
    }

    let { type = 'button', bg = null, children, onclick = () => undefined }: Props = $props()
</script>

<button {type} {onclick} class={bg}>
    {#if children}
        {@render children()}
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
