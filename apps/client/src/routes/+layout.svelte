<script lang="ts">
    import type { LayoutServerData } from './$types'
    import '../app.css'

    export let data: LayoutServerData
</script>

<nav>
    <div>
        <h2>
            <a href="/">Frontend Community</a>
        </h2>

        <ul class="links">
            <li>
                <a href="/register">Register</a>
            </li>
            <li>
                <a href="/signin">Sign in</a>
            </li>
            <li>
                <a href="/file-storage">File storage</a>
            </li>
            <li>
                <a href="/todo">TODO</a>
            </li>
        </ul>
    </div>

    <div>
        {data.userName}
    </div>
</nav>

<main class="app-layout">
    <slot />
</main>

<style>
    .app-layout {
        margin: 0 auto;
        max-width: var(--app-width);
        padding: 1rem 0;
        width: 100%;
    }

    nav {
        align-items: center;
        display: flex;
        justify-content: space-between;
        height: 80px;
        margin: 0 auto;
        max-width: var(--app-width);
    }

    .links {
        display: flex;
        flex-flow: row nowrap;
        gap: 1rem;
    }

    a {
        color: inherit;
        text-decoration: none;
    }
</style>
