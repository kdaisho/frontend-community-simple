<script lang="ts">
    import type { LayoutServerData } from './$types'

    export let data: LayoutServerData
</script>

<h2>Updates - {data.userName} {new Date().getTimezoneOffset()}</h2>

<!-- svelte-ignore a11y-distracting-elements -->
<marquee class="msg" scrollamount="40">
    There's something about the quiet before the world awakens that clarifies one's purpose. The
    song of the first bird, not yet drowned out by the day's chaos, reminds us of the clarity that
    comes with being the first to act. Sometimes we wonder, are we all just waiting for a new
    sunrise, or are we the ones who bring it forth?<span
        >&block;&block;&block;&block; &block;&block;&block; &block;&block; &block;&block;&block;.</span
    >
</marquee>

<style>
    .msg {
        color: var(--app-black);
        margin-top: 1rem;
    }

    .msg span {
        padding-left: 12rem;
    }
</style>
