<script lang="ts">
    import type { ActionData, PageData } from './$types'
    import { enhance } from '$app/forms'
    import { startAuthentication } from '@simplewebauthn/browser'

    export let data: PageData
    export let form: any

    let registrationData: any
    let loginEndpoint: string
    let submitButton: HTMLButtonElement
    let done = false

    $: {
        console.log('UI Sign ==>', { data, form })

        if (form?.loginOptions) {
            startAuthentication(form.loginOptions)
                .then(data => {
                    console.log('finally success!', data)
                    registrationData = JSON.stringify(data) // stringify to pass the data to server, otherwise the data will turn to be '[object, object]' and server can't parse it
                })
                .catch(err => {
                    console.error(err)
                })
                .finally(() => {
                    submitButton.click()
                    done = true
                })
            // const verificationRes = await API.webAuthn.loginVerification(email, loginRes)
        }

        if (form?.success) {
            if (form.webauthn) {
                loginEndpoint = 'signInWithWebAuthn'
            } else if (form.email) {
                loginEndpoint = 'signInWithEmail'
            }
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
        <input id="email" type="email" name="email" autocomplete="username" value="aa@aa.aa" />
    </fieldset>

    <button>Submit</button>
</form>

<br />

{#if form?.success && !form?.loginOptions}
    <form method="POST" action="?/webauthn-login-options" use:enhance>
        {#if form?.webauthn}
            <p>{loginEndpoint}</p>
            <button type="submit">Log in with Touch ID / Passkey</button>
            <input type="email" name="email" value={form.email} style="opacity: .2;" />
            <p>Or</p>
        {/if}
    </form>

    <form method="POST" action="?/signInWithEmail" use:enhance>
        <input type="email" name="email" value={form.email} style="opacity: .2;" />
        <button>Log in with email</button>
    </form>
{/if}

{#if !done}
    <form method="POST" action="?/webauthn-login-verification" use:enhance>
        <button type="submit" bind:this={submitButton} hidden>Submit Special 2</button>
        <input name="registrationData" value={registrationData} style="opacity: .35" />
    </form>
{/if}

<style>
    input {
        width: 100%;
    }
</style>
