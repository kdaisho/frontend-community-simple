<script lang="ts">
    export let id = ''
    export let type = 'text'
    export let name: string
    export let value: string | undefined
    export let placeholder = ''
    export let autocomplete = ''
</script>

{#if type === 'text'}
    <input {id} type="text" {name} {placeholder} bind:value {autocomplete} />
{:else if type === 'email'}
    <input {id} type="email" {name} {placeholder} bind:value {autocomplete} />
{/if}

<slot />

<style>
    input {
        padding: 0.25rem 0.5rem;
        width: 100%;
    }
</style>
