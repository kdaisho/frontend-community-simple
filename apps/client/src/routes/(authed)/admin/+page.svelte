<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData
</script>

<div class="admin">
    <h1>Admin page</h1>
    <h2>Users</h2>
    <ul>
        {#each data.users as user}
            <li>
                <span>
                    Name: {user.name}
                </span>
                <span>
                    Email: {user.email}
                </span>
                <span>
                    Authn enabled: {user.webauthn}
                </span>
                <span>
                    Admin: {user.isAdmin}
                </span>
                <span>
                    Device count: {user.devices.length}
                </span>
                <span>
                    Created at: {user.createdAt}
                </span>
            </li>
        {/each}
    </ul>
</div>

<style>
    li {
        display: flex;
        flex-direction: column;
    }
</style>
