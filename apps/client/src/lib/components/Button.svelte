<script lang="ts">
  import { melt } from '@melt-ui/svelte'
  import type { Readable } from 'svelte/store'

  export let type: 'button' | 'submit' | 'reset' = 'button'
  export let bg: null | 'yellow' | 'red' = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let trigger: Readable<any> | null = null
</script>

<button {type} on:click class={bg} use:melt={$trigger}>
  <slot>slot is required</slot>
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
