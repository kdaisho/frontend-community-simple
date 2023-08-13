<script lang="ts">
    import type { ActionData, PageData } from './$types'
    import { enhance } from '$app/forms'
    import { startAuthentication } from '@simplewebauthn/browser'

    export let data: PageData
    export let form: ActionData

    let registrationData: string

    $: {
        console.log('UI Sign ==>', { data, form })

        if (form?.loginOptions) {
            startAuthentication(form.loginOptions)
                .then(data => {
                    registrationData = JSON.stringify(data)
                    console.log('finally success!', registrationData)
                })
                .catch(err => {
                    console.error(err)
                })
                .finally(() => {
                    // submitButton.click()
                })
            // const verificationRes = await API.webAuthn.loginVerification(email, loginRes)
        }
    }
</script>

<h1>Sign in</h1>

{#if form?.error}
    <p class="error">{form.error}</p>
{/if}

<form method="POST" action="?/signIn" use:enhance>
    <fieldset>
        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            name="email"
            autocomplete="username"
            value="daishokomiyama+1@gmail.com"
        />
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
