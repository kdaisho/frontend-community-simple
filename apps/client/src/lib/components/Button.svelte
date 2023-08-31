<script lang="ts">
    export let type: 'button' | 'submit' | 'reset' = 'button'
    export let bg: null | 'yellow' | 'red' = null
</script>

<button {type} on:click class={bg}>
    <slot>slot is required</slot>
</button>

<style>
    button {
        background: var(--blue);
        border-radius: var(--border-radius);
        color: var(--white);
        cursor: pointer;
        font-size: var(--font-medium);
        height: 40px;
        min-width: 100px;
        padding: 0.25rem 1rem;
        transition: background 0.2s ease-in;
        white-space: nowrap;
    }

    button:hover {
        background: var(--blue-darker);
    }

    button.yellow {
        background: var(--yellow);
        color: var(--black);
    }

    button.red {
        background: var(--red);
    }
</style>
