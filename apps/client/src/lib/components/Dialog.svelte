<script lang="ts">
  import { createDialog, melt } from '@melt-ui/svelte'
  import { scale } from 'svelte/transition'

  const {
    elements: { trigger, overlay, content, title, description, close, portalled },
    states: { open },
  } = createDialog({
    forceVisible: true,
  })
</script>

<slot name="button" {trigger}>Default message</slot>

{#if $open}
  <div use:melt={$portalled} class="dialog-component">
    <div use:melt={$overlay} />
    <div
      use:melt={$content}
      transition:scale={{
        duration: 150,
        start: 0.9,
      }}
      class="dialog-content"
    >
      <h2 use:melt={$title}>Edit profile</h2>
      <p use:melt={$description}>Make changes to your profile here. Click save when you're done.</p>

      <fieldset>
        <label for="name">Name</label>
        <input id="name" value="Thomas G. Lopes" />
      </fieldset>

      <fieldset>
        <label for="username">Username</label>
        <input id="username" value="@thomasglopes" />
      </fieldset>
      <div>
        <button use:melt={$close}>Cancel</button>
        <button use:melt={$close}>Save changes</button>
      </div>
      <button use:melt={$close} aria-label="close">X</button>
    </div>
  </div>
{/if}

<style>
  .dialog-component {
    align-items: center;
    display: flex;
    position: fixed;
    height: 100vh;
    left: 0;
    justify-content: center;
    top: 0;
    width: 100%;
    z-index: 1000;
  }

  .dialog-content {
    background: var(--app-white);
    background: pink;
    box-shadow:
      rgba(0, 0, 0, 0.1) 0px 20px 25px -5px,
      rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
    margin: 0 auto;
    max-width: 400px;
    padding: 2rem;
    position: absolute;
    width: 100%;
    z-index: 3000;
  }
</style>
