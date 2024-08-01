<script lang="ts">
    import { goto } from '$app/navigation'
    import Button from '$lib/components/Button.svelte'
    import { startRegistration } from '@simplewebauthn/browser'
    import { tick } from 'svelte'
    import { defaults, superForm } from 'sveltekit-superforms'
    import { zod } from 'sveltekit-superforms/adapters'
    import { z } from 'zod'
    import type { PageServerData } from './$types'

    export let data: PageServerData

    let verifyRegistrationFormElem: HTMLFormElement

    const { enhance: registerPasskeyFormEnhance } = superForm(
        defaults(zod(z.object({ email: z.string().trim().email() }))),
        {
            id: 'register-passkey-form',
            async onResult({ result }) {
                if (result.type === 'success' && result.data?.email) {
                    $verifyRegistrationForm.email = result.data.email

                    try {
                        const registrationResponse = await startRegistration(
                            result.data.registrationOptions
                        )

                        $verifyRegistrationForm.registrationResponse =
                            JSON.stringify(registrationResponse)
                        await tick()
                        verifyRegistrationFormElem.requestSubmit()
                    } catch (err) {
                        if (!(err instanceof Error)) return
                        // Some basic error handling
                        if (err.name === 'InvalidStateError') {
                            console.error('Authenticator was probably already registered by user')
                        } else {
                            console.error(err.message)
                        }
                    }
                }
            },
        }
    )

    const { form: verifyRegistrationForm, enhance: verifyRegistrationEnhance } = superForm(
        defaults(
            zod(z.object({ email: z.string().trim().email(), registrationResponse: z.string() }))
        ),
        {
            id: 'verify-registration-form',
            async onResult({ result }) {
                if (result.type === 'success' && result.data) {
                    alert(result.data.message)
                    await goto(result.data.redirectTo, { replaceState: true })
                }
            },
        }
    )
</script>

<form
    method="POST"
    action="?/verifyRegistration"
    use:verifyRegistrationEnhance
    bind:this={verifyRegistrationFormElem}
>
    <input name="email" bind:value={$verifyRegistrationForm.email} hidden />
    <input
        name="registrationResponse"
        bind:value={$verifyRegistrationForm.registrationResponse}
        hidden
    />
</form>

<div class="setup-page">
    <h1>Passkey setup</h1>

    <form method="POST" action="?/registerPasskey" use:registerPasskeyFormEnhance>
        <input name="email" value={data.email} hidden />
        <Button type="submit" bg="yellow">Register a passkey for next login</Button>
    </form>

    <a href="/dashboard">Go to dashboard</a>
</div>

<style>
    .setup-page {
        display: grid;
        gap: 1rem;
    }
</style>
