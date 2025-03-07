<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation'
    import { grecaptchaStore } from '$lib/stores'
    import { onMount } from 'svelte'
    import '../styles/app.css'
    import '../styles/reset.css'
    import type { LayoutServerData } from './$types'
    interface Props {
        data: LayoutServerData;
        children?: import('svelte').Snippet;
    }

    let { data, children }: Props = $props();

    onMount(() => {
        // eslint-disable-next-line no-undef
        grecaptcha.ready(() => {
            // eslint-disable-next-line no-undef
            grecaptcha
                .execute('6LeXi2slAAAAAKiqg4QBRJNbDRtqqcMNwS95pHjC', { action: 'submit' })
                .then((token: string) => {
                    grecaptchaStore.set(token)
                })
        })
    })

    async function handleLogout() {
        const response = await fetch('/api/logout', {
            method: 'POST',
        })

        if (response.status === 200) {
            await Promise.all([invalidateAll(), goto('/signin')])
        }
    }
</script>

<div class="acme-community">
    <nav class="app-layout">
        <h2>
            <a href="/">The Brailler Community</a>
        </h2>

        <ul class="menu">
            {#if !data.userName}
                <li>
                    <a href="/register">Register</a>
                </li>
                <li>
                    <a href="/signin">Sign in</a>
                </li>
            {/if}

            <li>
                <a href="/file-storage">File storage</a>
            </li>
            <li>
                <a href="/todo">TODO</a>
            </li>
        </ul>

        <div class="user">
            {#if data.isAdmin}
                <a href="/admin">Admin</a>
            {/if}

            {#if data.userName}
                <a href="/dashboard">You</a>
                <button onclick={handleLogout}>Log out</button>
            {/if}
        </div>
    </nav>

    <main class="app-layout app-content">
        {@render children?.()}
    </main>

    <footer class="app-layout">
        <a href="privacy" title="Privacy policy">Privacy policy</a>
    </footer>
</div>

<style>
    .acme-community {
        padding: 1.5rem 1rem;
    }

    .app-layout {
        max-width: var(--app-width);
    }

    .app-content {
        margin: 0 auto;
        padding: 2.5rem 0;
        width: 100%;
    }

    nav {
        display: grid;
        gap: 0.25rem 0.75rem;
        grid-template-columns: auto auto;
        grid-template-rows: 1fr 1fr;
        grid-template-areas:
            'title title'
            'menu user';
        margin: 0 auto;
        max-width: var(--app-width);
    }

    h2 {
        grid-area: title;
    }

    .menu {
        align-items: center;
        display: flex;
        flex-flow: row nowrap;
        gap: 1rem;
        grid-area: menu;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    .user {
        align-items: center;
        display: flex;
        gap: 1rem;
        grid-area: user;
        justify-content: flex-end;
    }

    footer {
        margin: 0 auto;
    }

    footer a {
        color: var(--blue-darker);
    }

    @media (max-width: 480px) {
        nav {
            gap: 1rem 0.75rem;
            grid-template-areas:
                'title user'
                'menu menu';
        }

        .user {
            align-items: flex-end;
        }
    }
</style>
