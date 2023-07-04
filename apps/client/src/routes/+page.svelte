<script lang="ts">
    import type { LayoutServerData } from './$types'

    export let data: LayoutServerData
</script>

<h2>Welcome {data.userName}</h2>
