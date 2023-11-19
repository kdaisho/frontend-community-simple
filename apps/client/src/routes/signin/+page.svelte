<script lang="ts">
    import { enhance } from '$app/forms'
    import { goto } from '$app/navigation'
    import RecaptchaPrivacyPolicy from '$lib/RecaptchaPrivacyPolicy.svelte'
    import Button from '$lib/components/Button.svelte'
    import TextInput from '$lib/components/TextInput.svelte'
    import { grecaptchaStore } from '$lib/stores'
    import { startAuthentication } from '@simplewebauthn/browser'
    import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types'
    import type { ActionData } from './$types'

    export let form: ActionData

    let email: string
    let grecaptchaToken: string

    grecaptchaStore.subscribe(value => {
        grecaptchaToken = value ?? ''
    })

    async function handleAuthentication(result: unknown) {
        const { data } = result as {
            data: { loginOptions: PublicKeyCredentialRequestOptionsJSON; email: string }
        }

        const authenticationResponse = await startAuthentication(data.loginOptions)

        if (authenticationResponse) {
            try {
                const response = await fetch('api/webauthn/verifyLogin', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: data.email,
                        data: authenticationResponse,
                    }),
                })
                const { success, redirectTo } = await response.json()
                if (success) {
                    await goto(redirectTo)
                }
            } catch (err) {
                console.error('webauthn verification failed', err)
            }
        }
    }

    $: {
        console.log('==> EMAIL', email)
    }
</script>

<div class="sign-in">
    <h1>Sign in</h1>

    <form method="POST" action="?/signIn" use:enhance>
        <fieldset>
            <label for="email"
                >Email
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    bind:value={email}
                    autocomplete="username"
                >
                    {#if form?.error && form.type === 'email'}
                        <p class="error">{form.error}</p>
                    {/if}</TextInput
                >
            </label>

            <input type="hidden" name="grecaptchaToken" value={grecaptchaToken} />
        </fieldset>

        <Button type="submit">Submit</Button>
    </form>

    <br />

    {#if form?.success}
        {#if form.webauthn}
            <form
                method="POST"
                action="?/webauthnGetLoginOptions"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.status === 200) {
                            await handleAuthentication(result)
                        }
                        await update({ reset: false })
                    }
                }}
            >
                <Button type="submit" bg="yellow">Log in with Touch ID / Passkey</Button>
                <input type="hidden" name="email" bind:value={email} />
            </form>
        {/if}

        {#if form.webauthn}
            <p class="or">OR</p>
        {/if}

        {#if form.email}
            <form method="POST" action="?/signInWithEmail" use:enhance>
                <input type="hidden" name="email" bind:value={email} />
                <Button type="submit" bg="yellow">Log in with email</Button>
            </form>
        {/if}
    {/if}

    <RecaptchaPrivacyPolicy />
</div>

<style>
    .sign-in {
        display: flex;
        flex-flow: column nowrap;
        gap: 2rem;
    }

    form {
        display: flex;
        flex-flow: column nowrap;
        gap: 2.5rem;
        max-width: 400px;
    }

    .or {
        margin: 1rem 0;
    }

    input {
        width: 100%;
    }
</style>
