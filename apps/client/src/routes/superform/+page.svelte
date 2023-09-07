<script lang="ts">
    import { setError, superForm } from 'sveltekit-superforms/client'
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
    import type { PageData } from './$types'
    import { schema } from './validators'

    export let data: PageData

    const { form, errors, enhance, validate } = superForm(data.form, {
        validators: schema,
        applyAction: true,
        invalidateAll: true,
        taintedMessage: null,
        resetForm: false,
        onSubmit: val => {
            console.log('==> onSubmit', val)
        },
    })

    $: {
        if ($errors.address) {
            setError(data.form, 'address', 'Address is required man', {
                overwrite: true,
                status: 401,
            })
            console.log('==> $errors', $errors)
        }
    }

    const handleOnBlur = async () => {
        console.log('==> submitting on blur', $form)

        const response = await fetch('?/save', {
            method: 'POST',
            body: JSON.stringify($form),
            headers: {
                'full-submit': 'false',
                'x-sveltekit-action': 'true',
            },
        })

        const result = await response.json()

        console.log('==> response data', result)
        console.log('==> response data', JSON.parse(result.data))
    }
</script>

<form class="inner" method="POST" action="?/save" use:enhance>
    <label for="name">Name</label>
    <input
        type="text"
        id="name"
        name="name"
        bind:value={$form.name}
        aria-invalid={$errors.name ? 'true' : undefined}
        on:blur={handleOnBlur}
    />
    {#if $errors.name}
        <p>{$errors.name}</p>
    {/if}

    <label for="address">Address</label>
    <input
        type="text"
        id="address"
        name="address"
        bind:value={$form.address}
        aria-invalid={$errors.address ? 'true' : undefined}
        on:blur={handleOnBlur}
    />
    {#if $errors.address}
        <p>{$errors.address}</p>
    {/if}

    <label for="age">Age</label>
    <input
        type="number"
        id="age"
        name="age"
        bind:value={$form.age}
        aria-invalid={$errors.age ? 'true' : undefined}
        on:blur={handleOnBlur}
    />
    {#if $errors.age}
        <p>{$errors.age}</p>
    {/if}

    <br />

    <button type="submit">Submit</button>
    <!-- <Button type="submit" ref={myButton}>Submit</Button> -->
</form>

<div class="debugger">
    <SuperDebug data={$form} />
</div>

<style>
    .debugger {
        position: absolute;
        bottom: 100px;
        left: 100px;
    }

    label,
    input {
        display: block;
    }

    p {
        color: red;
    }
</style>
