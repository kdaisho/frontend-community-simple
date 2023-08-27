<script lang="ts">
    import { enhance } from '$app/forms'
    import { grecaptchaStore } from '$lib/stores'
    import type { ActionData } from './$types'

    export let form: ActionData

    let grecaptchaToken: string

    grecaptchaStore.subscribe(value => {
        grecaptchaToken = value ?? ''
    })
</script>

<h1>Join our community</h1>

{#if form?.error}
    <p class="error">{form.error}</p>
{/if}

<form method="POST" action="?/register" use:enhance>
    <fieldset>
        <label for="name">Name</label>
        <input id="name" type="text" name="name" value={form?.name ?? ''} autocomplete="name" />
    </fieldset>
    <fieldset>
        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            name="email"
            autocomplete="username"
            value={form?.email ?? ''}
        />
        <input name="grecaptchaToken" value={grecaptchaToken} />
    </fieldset>

    <button>Submit</button>
</form>

<style>
    input {
        width: 100%;
    }
</style>
