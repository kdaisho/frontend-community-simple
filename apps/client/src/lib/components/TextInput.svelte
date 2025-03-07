<script lang="ts">
    import type { FullAutoFill } from 'svelte/elements'
    interface Props {
        id?: string
        type?: string
        name: string
        value?: string | undefined
        placeholder?: string
        autocomplete?: FullAutoFill | null | undefined
        children?: import('svelte').Snippet
    }

    let {
        id = '',
        type = 'text',
        name,
        value = $bindable(undefined),
        placeholder = '',
        autocomplete = null,
        children,
    }: Props = $props()
</script>

{#if type === 'text'}
    <input {id} type="text" {name} {placeholder} bind:value {autocomplete} />
{:else if type === 'email'}
    <input {id} type="email" {name} {placeholder} bind:value {autocomplete} />
{/if}

{@render children?.()}

<style>
    input {
        padding: 0.25rem 0.5rem;
        width: 100%;
    }
</style>
