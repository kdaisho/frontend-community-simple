<script lang="ts">
    import type { PageServerData } from './$types'
    import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/typescript-types'
    import { enhance } from '$app/forms'
    import { startRegistration } from '@simplewebauthn/browser'

    export let data: PageServerData

    async function handleRegistration(result: unknown) {
        const { data } = result as {
            data: { registrationOptions: PublicKeyCredentialCreationOptionsJSON; email: string }
        }

        const registrationResponse = await startRegistration(data.registrationOptions)
        const stringifiedRegistrationResponse = JSON.stringify(registrationResponse)

        if (stringifiedRegistrationResponse) {
            try {
                const response = await fetch('api/webauthn-registration-verification', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: data.email,
                        data: stringifiedRegistrationResponse,
                    }),
                })

                if (response.ok) {
                    const { success, message } = await response.json()
                    if (success) {
                        alert(message)
                    }
                }
            } catch (err) {
                console.error('webauthn registration verification failed', err)
            }
        }
    }
</script>

<h1>Dashboard of {data.userName}</h1>

<form
    method="POST"
    action="?/webauthn-registration-options"
    use:enhance={() => {
        return async ({ result, update }) => {
            if (result.status === 200) {
                await handleRegistration(result)
            }
            await update({ reset: false })
        }
    }}
>
    <button type="submit">Register Touch ID for next login</button>
    <input type="hidden" name="email" value={data.email} />
</form>
