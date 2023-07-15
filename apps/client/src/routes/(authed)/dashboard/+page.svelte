<script lang="ts">
    import type { PageServerData } from './$types'
    import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/typescript-types'
    import { enhance } from '$app/forms'
    import { startRegistration } from '@simplewebauthn/browser'

    export let data: PageServerData
    export let form: PublicKeyCredentialCreationOptionsJSON

    $: if (form) {
        startRegistration(form)
            .then(res => {
                console.log('==> RES', res)
            })
            .catch(err => {
                console.log('==> UI ERR', err)
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
    <button type="submit">Register Touch ID for next login </button>

    <input type="hidden" name="userId" value={data.email} />
</form>
