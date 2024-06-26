<script lang="ts">
    import { enhance } from '$app/forms'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import Button from '$lib/components/Button.svelte'
    import { startRegistration } from '@simplewebauthn/browser'
    import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/typescript-types'
    import type { PageServerData } from './$types'

    export let data: PageServerData

    function isRegistrationOptionsData(arg: object): arg is {
        data: { email: string; registrationOptions: PublicKeyCredentialCreationOptionsJSON }
    } {
        if (
            'data' in arg &&
            arg['data'] instanceof Object &&
            'email' in arg['data'] &&
            'registrationOptions' in arg['data']
        ) {
            return true
        }
        return false
    }

    async function handleRegistration(data: {
        email: string
        registrationOptions: PublicKeyCredentialCreationOptionsJSON
    }) {
        try {
            const registrationResponse = await startRegistration(data.registrationOptions)
            const stringifiedRegistrationResponse = JSON.stringify(registrationResponse)

            if (!stringifiedRegistrationResponse) return

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

                        const url = new URL($page.url)
                        const params = new URLSearchParams(url.search)
                        params.delete('shouldOfferWebauthn')
                        url.search = params.toString()
                        await goto(url.toString(), { replaceState: true })
                    }
                }
            } catch (err) {
                console.error(err)
            }
        } catch (err) {
            // the passkey has been registered already (most likely)
            // dialog for the user is rendered by the authn library (only desktop somehow..) so no need to do anything here
            console.info(err)
        }
    }
</script>

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

    {#if data.shouldOfferWebauthn}
        <form
            method="POST"
            action="?/webauthnGetRegistrationOptions"
            use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.status === 200 && isRegistrationOptionsData(result)) {
                        await handleRegistration(result.data)
                    }
                    await update({ reset: false })
                }
            }}
        >
            <Button type="submit" bg="yellow">Register biometric ID for next login</Button>

            <input type="hidden" name="email" value={data.email} />
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
