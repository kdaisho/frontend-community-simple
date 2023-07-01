<script lang="ts">
    export let type: 'button' | 'submit' | 'reset' = 'button'
</script>

<button {type} on:click>
    <slot>Empty</slot>
</button>

<style>
    button {
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: var(--border-radius);
        color: #333;
        font-size: 1rem;
        padding: 0.25rem 1rem;
        white-space: nowrap;
    }

    button:hover {
        cursor: pointer;
    }
</style>
