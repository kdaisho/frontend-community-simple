<script lang="ts">
    import type { ActionData, PageData } from './$types'
    import { enhance } from '$app/forms'

    export let data: PageData
    export let form: ActionData

    $: {
        console.log('UI Sign ==>', { data, form })
    }
</script>

<h1>Sign in</h1>

{#if form?.error}
    <p class="error">{form.error}</p>
{/if}

<form method="POST" action="?/signIn" use:enhance>
    <fieldset>
        <label for="email">Email</label>
        <input id="email" type="email" name="email" autocomplete="username" />
    </fieldset>

    <button>Submit</button>
</form>

{#if form?.webauthn}
    <form method="POST" action="?/signInWebAuthn" use:enhance>
        <button type="submit">Log in with Touch ID / Passkey</button>
        <input type="text" name="userId" value={form.userId} />
    </form>
{/if}

<style>
    input {
        width: 100%;
    }
</style>
