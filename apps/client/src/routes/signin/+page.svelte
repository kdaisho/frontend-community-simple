<script lang="ts">
    import type { ActionData } from './$types'
    import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types'
    import { enhance } from '$app/forms'
    import { goto } from '$app/navigation'
    import { startAuthentication } from '@simplewebauthn/browser'

    export let form: ActionData
    let email: string

    async function handleAuthentication(result: unknown) {
        const { data } = result as {
            data: { loginOptions: PublicKeyCredentialRequestOptionsJSON; email: string }
        }

        const authenticationResponse = await startAuthentication(data.loginOptions)

        if (authenticationResponse) {
            try {
                const response = await fetch('api/webauthn-login-verification', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: data.email,
                        data: authenticationResponse,
                    }),
                })
                const { success, redirectTo } = await response.json()
                if (success) {
                    goto(redirectTo)
                }
            } catch (err) {
                console.error('webauthn verification failed', err)
            }
        }
    }
</script>

<h1>Sign in</h1>

{#if form && 'error' in form}
    <p class="error">{form.error}</p>
{/if}

<form method="POST" action="?/signIn" use:enhance>
    <fieldset>
        <label for="email">Email</label>
        <input id="email" type="email" name="email" bind:value={email} autocomplete="username" />
    </fieldset>

    <button>Submit</button>
</form>

<br />

{#if form?.success}
    {#if form.webauthn}
        <form
            method="POST"
            action="?/webauthn-login-options"
            use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.status === 200) {
                        await handleAuthentication(result)
                    }
                    await update({ reset: false })
                }
            }}
        >
            <button type="submit">Log in with Touch ID / Passkey</button>
            <input type="hidden" name="email" bind:value={email} />
            <p>Or</p>
        </form>
    {/if}

    {#if form.email}
        <form method="POST" action="?/signInWithEmail" use:enhance>
            <input type="hidden" name="email" bind:value={email} />
            <button>Log in with email</button>
        </form>
    {/if}
{/if}

<style>
    input {
        width: 100%;
    }
</style>
