<script lang="ts">
    import { enhance } from '$app/forms'
    import Button from '$lib/components/Button.svelte'
    import { startRegistration } from '@simplewebauthn/browser'
    import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/typescript-types'
    import type { PageServerData } from './$types'

    export let data: PageServerData

    async function handleRegistration(result: unknown) {
        const { data } = result as {
            data: { registrationOptions: PublicKeyCredentialCreationOptionsJSON; email: string }
        }

        const registrationResponse = await startRegistration(data.registrationOptions)
        const stringifiedRegistrationResponse = JSON.stringify(registrationResponse)

        if (stringifiedRegistrationResponse) {
            try {
                const response = await fetch('api/webauthn/verifyRegistration', {
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

<div class="dashboard">
    <h1>{data.userName}'s dashboard</h1>

    <form
        method="POST"
        action="?/webauthnGetRegistrationOptions"
        use:enhance={() => {
            return async ({ result, update }) => {
                if (result.status === 200) {
                    await handleRegistration(result)
                }
                await update({ reset: false })
            }
        }}
    >
        {#if !data.webauthn}
            <Button type="submit" bg="yellow">Register biometric ID for next login</Button>
        {/if}

        <input type="hidden" name="email" value={data.email} />
    </form>
</div>

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
</style>
