<script lang="ts">
    import { enhance } from '$app/forms'
    import Button from '$lib/components/Button.svelte'
    import type { ActionData, PageData } from '../file-storage/$types'

    interface Props {
        data: PageData
        form: ActionData
    }

    let { data, form }: Props = $props()
</script>

<h1>{data.title}</h1>

<form method="POST" action="file-storage?/uploadFile" use:enhance>
    <fieldset>
        <label for="file">Choose a file:</label>
        <input type="file" id="file" name="files" accept="text/plain, image/jpeg" />
    </fieldset>

    <Button type="submit">Submit</Button>

    {#if form?.message}
        <output>{form?.message}</output>
    {/if}
</form>

<form method="POST" action="file-storage?/downloadFile" use:enhance>
    <fieldset>
        <label for="filename">File name</label>
        <input type="text" id="filename" name="filename" />
    </fieldset>

    <Button type="submit">Download</Button>
</form>

<style>
    form {
        align-items: flex-start;
        display: flex;
        flex-flow: column nowrap;
        gap: 2rem;
    }
</style>
