<script lang="ts">
    import { enhance } from '$app/forms'
    import RecaptchaPrivacyPolicy from '$lib/RecaptchaPrivacyPolicy.svelte'
    import Button from '$lib/components/Button.svelte'
    import TextInput from '$lib/components/TextInput.svelte'
    import { grecaptchaStore } from '$lib/stores'
    import type { ActionData } from './$types'

    export let form: ActionData

    let grecaptchaToken: string

    grecaptchaStore.subscribe(value => {
        grecaptchaToken = value ?? ''
    })
</script>

<div class="register">
    <h1>Join us today</h1>

    <form method="POST" action="?/register" use:enhance>
        <fieldset>
            <label for="name"
                >Name
                <TextInput
                    id="name"
                    type="text"
                    name="name"
                    value={form?.name ?? ''}
                    autocomplete="name"
                >
                    {#if form?.error && form.type === 'name'}
                        <p class="error">{form.error}</p>
                    {/if}
                </TextInput>
            </label>

            <label for="email"
                >Email
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={form?.email ?? ''}
                    autocomplete="username"
                >
                    {#if form?.error && form.type === 'email'}
                        <p class="error">{form.error}</p>
                    {/if}
                </TextInput>
            </label>
        </fieldset>

        <input type="hidden" name="grecaptchaToken" value={grecaptchaToken} />

        <Button type="submit">Submit</Button>
    </form>
</div>

<RecaptchaPrivacyPolicy />

<style>
    .register {
        display: flex;
        flex-flow: column nowrap;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    form {
        max-width: var(--form-max-width);
        display: flex;
        flex-flow: column nowrap;
        gap: 2.5rem;
    }

    fieldset {
        display: flex;
        flex-flow: column nowrap;
        gap: 1rem;
    }

    input {
        width: 100%;
    }
</style>
