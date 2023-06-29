<script lang="ts">
    import type { ActionData, PageData } from './$types'

    export let data: PageData
    export let form: ActionData

    $: {
        console.log('==> UI data', data)
        console.log('==> UI form', form)
    }
</script>

<h1>Handling signin</h1>
