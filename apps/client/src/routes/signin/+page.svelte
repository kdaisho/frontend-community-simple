<script lang="ts">
    import { goto } from '$app/navigation'
    import RecaptchaPrivacyPolicy from '$lib/RecaptchaPrivacyPolicy.svelte'
    import Button from '$lib/components/Button.svelte'
    import TextInput from '$lib/components/TextInput.svelte'
    import { grecaptchaStore } from '$lib/stores'
    import { startAuthentication } from '@simplewebauthn/browser'
    import { onMount, tick } from 'svelte'
    import { zod } from 'sveltekit-superforms/adapters'
    import { defaults, superForm } from 'sveltekit-superforms/client'
    import { z } from 'zod'
    import type { ActionData } from './$types'

    export let form: ActionData

    let grecaptchaToken: string
    let verifyLoginFormElem: HTMLFormElement

    grecaptchaStore.subscribe(value => {
        grecaptchaToken = value ?? ''
    })

    const { form: signinForm, enhance: signinFormEnhance } = superForm(
        defaults(zod(z.object({ email: z.string().trim().email() }))),
        {
            id: 'signin-form',
            onUpdated({ form }) {
                if (form.valid) {
                    $signinWithPasskeyForm.email = form.data.email
                }
            },
        }
    )

    const { form: signinWithPasskeyForm, enhance: signinWithPasskeyFormEnhance } = superForm(
        defaults(zod(z.object({ email: z.string().trim().email() }))),
        {
            id: 'signin-with-passkey-form',
            async onResult({ result }) {
                if (result.type === 'success' && result.data?.loginOptions) {
                    const response = await startAuthentication(result.data.loginOptions)

                    if (response) {
                        $verifyLoginForm.email = result.data.email
                        $verifyLoginForm.authenticationResponse = JSON.stringify(response)
                        await tick()
                        verifyLoginFormElem.requestSubmit()
                    }
                }
            },
        }
    )

    const { form: verifyLoginForm, enhance: verifyLoginFormEnhance } = superForm(
        defaults(
            zod(z.object({ email: z.string().trim().email(), authenticationResponse: z.string() }))
        ),
        {
            id: 'verify-login-form',
            async onResult({ result }) {
                if (result.type === 'success' && result.data?.redirectTo) {
                    await goto(result.data.redirectTo)
                }
            },
        }
    )

    const { enhance: signinWithEmailFormEnhance } = superForm(
        defaults(zod(z.object({ email: z.string().trim().email() })))
    )

    let mounted = false
    onMount(() => {
        mounted = true
    })
</script>

<svelte:head>
    {#if mounted}
        <script src="https://accounts.google.com/gsi/client" async></script>
        <script>
            function signinWithGoogle(data) {
                console.log('==>', data)
            }
        </script>
    {/if}
</svelte:head>

{#if $verifyLoginForm.email}
    <form
        method="POST"
        action="?/verifyLogin"
        use:verifyLoginFormEnhance
        bind:this={verifyLoginFormElem}
    >
        <input name="email" bind:value={$verifyLoginForm.email} hidden />
        <input
            name="authenticationResponse"
            bind:value={$verifyLoginForm.authenticationResponse}
            hidden
        />
    </form>
{/if}

<div class="sign-in">
    <h1>Sign in</h1>

    <form method="POST" action="?/signIn" use:signinFormEnhance>
        <fieldset>
            <label for="email">
                Email
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    bind:value={$signinForm.email}
                    autocomplete="username"
                />
            </label>

            <input name="grecaptchaToken" value={grecaptchaToken} hidden />
        </fieldset>

        <Button type="submit">Submit</Button>
    </form>

    <br />

    <div
        id="g_id_onload"
        data-client_id="136252634632-at5qh5h5n5hsf29hmmi1k3ied5dc9god.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="signinWithGoogle"
        data-auto_prompt="false"
    ></div>
    <div
        class="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
    ></div>

    <br />

    {#if form?.webauthn}
        <form method="POST" action="?/signinWithPasskey" use:signinWithPasskeyFormEnhance>
            <input name="email" bind:value={$signinWithPasskeyForm.email} hidden />
            <Button type="submit" bg="yellow">Log in with Touch ID / Passkey</Button>
        </form>

        <p class="or">OR</p>

        <form method="POST" action="?/signinWithEmail" use:signinWithEmailFormEnhance>
            <input name="email" bind:value={form.email} hidden />
            <Button type="submit" bg="yellow">Log in with email</Button>
        </form>
    {/if}

    <RecaptchaPrivacyPolicy />
</div>

<style>
    .sign-in {
        display: flex;
        flex-flow: column nowrap;
        gap: 2rem;
    }

    form {
        display: flex;
        flex-flow: column nowrap;
        gap: 2.5rem;
        max-width: 400px;
    }

    .or {
        margin: 1rem 0;
    }

    input {
        width: 100%;
    }
</style>
