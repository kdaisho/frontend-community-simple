<script lang="ts">
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    interface Props {
        type?: 'button' | 'submit' | 'reset';
        width?: number;
        color?: string;
        children?: import('svelte').Snippet;
    }

    let {
        type = 'button',
        width = 40,
        color = '#000',
        children
    }: Props = $props();
</script>

<button {type} style="--neumorphism-button-width: {width}px" style:color onclick={bubble('click')}>
    {#if children}{@render children()}{:else}Empty{/if}
</button>

<style>
    button:hover {
        cursor: pointer;
    }

    button {
        align-items: center;
        aspect-ratio: 1;
        background: var(--app-white);
        border-radius: 50%;
        box-shadow: -4px -4px 8px #fff, 4px 4px 8px rgb(0 0 0 / 24%);
        display: flex;
        font-size: 1.25rem;
        justify-content: center;
        padding-bottom: 2px;
        width: var(--neumorphism-button-width);
    }

    @media (any-hover: hover) {
        button {
            transition: box-shadow 0.2s;
        }

        button:hover {
            box-shadow: -2px -2px 4px #fff, 2px 2px 4px rgb(0 0 0 / 24%);
        }

        button:active {
            background-color: #ebebeb;
            box-shadow: inset 4px 4px 8px rgb(0 0 0 / 16%);
        }
    }
</style>
