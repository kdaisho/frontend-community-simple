<script lang="ts">
    import type { ActionData } from './$types'
    import { enhance } from '$app/forms'
    import { goto } from '$app/navigation'
    import { startAuthentication } from '@simplewebauthn/browser'

    export let form: ActionData
    let email = 'tt@tt.tt'

    $: {
        if (form?.data && 'challenge' in form.data) {
            startAuthentication(form.data).then(data => {
                fetch('api/webauthn-login-verification', {
                    method: 'POST',
                    body: JSON.stringify({
                        email,
                        data,
                    }),
                }).then(async res => {
                    const { success, redirectTo } = await res.json()

                    if (success) {
                        goto(redirectTo)
                    }
                })
            })
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

<form
    method="POST"
    action="?/webauthn-login-options"
    use:enhance={() => {
        return async ({ update }) => {
            update({ reset: false })
        }
    }}
>
    {#if form?.webauthn}
        <button type="submit">Log in with Touch ID / Passkey</button>
        <input type="email" name="email" value={email} style="opacity: .2;" />
        <p>Or</p>
    {/if}
</form>

<form method="POST" action="?/signInWithEmail" use:enhance>
    <input type="email" name="email" value={email} style="opacity: .2;" />
    <button>Log in with email</button>
</form>

<style>
    input {
        width: 100%;
    }
</style>
