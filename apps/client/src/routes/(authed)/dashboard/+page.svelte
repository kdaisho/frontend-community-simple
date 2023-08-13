<script lang="ts">
    import type { PageServerData } from './$types'
    import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/typescript-types'
    import { enhance } from '$app/forms'
    import { startRegistration } from '@simplewebauthn/browser'

    export let data: PageServerData
    export let form: { registrationOptions: PublicKeyCredentialCreationOptionsJSON | null }

    let registrationData: string
    let submitButton: HTMLButtonElement

    $: {
        console.log('==> reactive', form)
    }

    $: if (form && form.registrationOptions) {
        startRegistration(form.registrationOptions)
            .then(data => {
                alert('success!')
                registrationData = JSON.stringify(data)
            })
            .catch(err => {
                console.log('==> Dashboard UI ERR', err)
            })
            .finally(() => {
                // submitButton.click()
                // form.registrationOptions = null
            })
    }

    // TODO: Final step is run '/auth/webauth-login-verification' step
    // pass registrationData to verifyAuthenticationResponse (SimpleWebAuthn method)
</script>

<h1>Dashboard of {data.userName}</h1>

<form
    method="POST"
    action="?/registerWebAuthn"
    use:enhance={() =>
        async ({ update }) =>
            await update({ reset: false })}
>
    <button type="submit">Register Touch ID for next login</button>
    <input type="hidden" name="userId" value={data.email} />
</form>

<form method="POST" action="?/registrationWebAuthnVerification" use:enhance>
    <button type="submit" bind:this={submitButton}>Submit Special</button>
    <input name="registrationData" value={registrationData} />
</form>
