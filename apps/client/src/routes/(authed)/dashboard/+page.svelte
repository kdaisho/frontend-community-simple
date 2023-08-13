<script lang="ts">
    import type { PageServerData } from './$types'
    import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/typescript-types'
    import { enhance } from '$app/forms'
    import { startRegistration } from '@simplewebauthn/browser'

    export let data: PageServerData
    export let form: {
        registrationOptions: PublicKeyCredentialCreationOptionsJSON | null
        registrationOptions_: PublicKeyCredentialCreationOptionsJSON | null
    }

    let registrationData: string
    let submitButton: HTMLButtonElement
    let step1 = true

    $: {
        console.log('==> reactive', form)
    }

    $: if (form?.registrationOptions && step1) {
        startRegistration(form.registrationOptions)
            .then(data => {
                registrationData = JSON.stringify(data)
                step1 = false
            })
            .catch(err => {
                console.error('==> Dashboard UI ERR', err)
            })
            .finally(() => {
                submitButton.click()
                alert('You can now login with WebAuthn')
            })
    }
</script>

<h1>Dashboard of {data.userName}</h1>

<!-- WEBAUTHN 1st endpoint -->
{#if step1}
    <form
        method="POST"
        action="?/webauthn-registration-options"
        use:enhance={() =>
            async ({ update }) =>
                await update({ reset: false })}
    >
        <button type="submit">Register Touch ID for next login</button>
        <input type="hidden" name="email" value={data.email} />
    </form>
{/if}

<!-- WEBAUTHN 2st endpoint -->
<form method="POST" action="?/webauthn-registration-verification" use:enhance>
    <button type="submit" bind:this={submitButton} hidden>Submit Special</button>
    <input type="hidden" name="email" value={data.email} />
    <input type="hidden" name="registrationData" value={registrationData} />
</form>
