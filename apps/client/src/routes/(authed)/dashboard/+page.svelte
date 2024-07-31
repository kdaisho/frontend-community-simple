<script lang="ts">
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
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

                    console.log('==> step1 result', result.data)

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
                    const url = new URL($page.url)
                    const params = new URLSearchParams(url.search)
                    params.delete('shouldOfferWebauthn')
                    url.search = params.toString()
                    await goto(url.toString(), { replaceState: true })
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

<div class="dashboard">
    <h1>Dashboard</h1>

    <div class="table-container">
        <table>
            <caption>It's you.</caption>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Webauthn</th>
                <th>Should offer webauthn</th>
            </tr>

            <tr>
                <td>{data.userName}</td>
                <td>{data.email}</td>
                <td>{data.isAdmin}</td>
                <td>{data.webauthn}</td>
                <td>{data.shouldOfferWebauthn}</td>
            </tr>
        </table>
    </div>

    {#if data.shouldOfferWebauthn || true}
        <form method="POST" action="?/registerPasskey" use:registerPasskeyFormEnhance>
            <input name="email" value={data.email} hidden />
            <Button type="submit" bg="yellow">Register a passkey for next login</Button>
        </form>
    {/if}
</div>

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .table-container {
        width: 100%;
        overflow-x: auto;
    }

    table,
    caption {
        text-align: left;
    }

    caption {
        padding-bottom: 0.5rem;
    }

    table {
        border: 1px solid var(--light-grey);
        border-collapse: collapse;
    }

    th,
    td {
        padding: 0.25rem 0.5rem;
    }

    th {
        border-bottom: 1px solid var(--app-black);
        font-size: 0.75rem;
        font-weight: normal;
        white-space: nowrap;
    }
</style>
