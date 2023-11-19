<script lang="ts">
    import { enhance } from '$app/forms'
    import RecaptchaPrivacyPolicy from '$lib/RecaptchaPrivacyPolicy.svelte'
    import Button from '$lib/components/Button.svelte'
    import { grecaptchaStore } from '$lib/stores'
    import type { ActionData } from './$types'

    export let form: ActionData

    let grecaptchaToken: string

    grecaptchaStore.subscribe(value => {
        grecaptchaToken = value ?? ''
    })
</script>

<div class="register">
    <h1>Join our community</h1>

    <form method="POST" action="?/register" use:enhance>
        <fieldset>
            <label for="name">Name</label>
            <input id="name" type="text" name="name" value={form?.name ?? ''} autocomplete="name" />
            {#if form?.error && form.type === 'name'}
                <p class="error">{form.error}</p>
            {/if}
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
            {#if form?.error && form.type === 'email'}
                <p class="error">{form.error}</p>
            {/if}
            <input type="hidden" name="grecaptchaToken" value={grecaptchaToken} />
        </fieldset>

        <Button type="submit">Submit</Button>
    </form>
</div>

<RecaptchaPrivacyPolicy />

<style>
    .register {
        display: flex;
        flex-flow: column nowrap;
        gap: 2rem;
    }

    form {
        align-items: flex-start;
        display: flex;
        flex-flow: column nowrap;
        gap: 1rem;
    }

    input {
        width: 100%;
    }

    .error {
        color: var(--danger);
    }
</style>
