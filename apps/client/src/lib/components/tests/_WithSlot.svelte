<script lang="ts">
    import type { SvelteComponent } from 'svelte'

    export let component: typeof SvelteComponent
    export let properties = {}
    export let slot: typeof SvelteComponent | string | null = null
</script>

{#if slot}
    <svelte:component this={component} {...properties}>
        {#if typeof slot !== 'string'}
            <svelte:component this={slot} />
        {:else}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html slot}
        {/if}
    </svelte:component>
{:else}
    <svelte:component this={component} {...properties} />
{/if}
