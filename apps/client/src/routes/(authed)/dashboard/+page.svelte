<script lang="ts">
    import type { PageServerData } from './$types'
    import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/typescript-types'
    import { enhance } from '$app/forms'
    import { startRegistration } from '@simplewebauthn/browser'

    export let data: PageServerData
    export let form: PublicKeyCredentialCreationOptionsJSON

    let registrationData: string
    let submitButton: HTMLButtonElement

    $: if (form) {
        startRegistration(form)
            .then(data => {
                registrationData = JSON.stringify(data)
            })
            .catch(err => {
                console.log('==> UI ERR', err)
            })
            .finally(() => {
                submitButton.click()
            })
    }
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
    <button type="submit" bind:this={submitButton} hidden>Submit</button>
    <input type="hidden" name="registrationData" value={registrationData} />
</form>
