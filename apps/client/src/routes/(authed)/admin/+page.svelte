<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData

    function formatDateToLocal(utcDateString: unknown): string {
        if (typeof utcDateString !== 'string') return ''
        const date = new Date(utcDateString)
        return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    }
</script>

<div class="admin">
    <h1>Admin page</h1>

    <div class="table-container">
        <table>
            <caption>Passkeys</caption>
            <tbody>
                <tr>
                    <th>User name</th>
                    <th>User email</th>
                    <th>Device type</th>
                    <th>Admin user</th>
                    <th>Passkey created at</th>
                </tr>
                {#each data.users as user}
                    <tr>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.deviceType ?? 'N/A'}</td>
                        <td>{user.isAdmin}</td>
                        <td>{formatDateToLocal(user.createdAt)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="table-container">
        <table>
            <caption>Footprints</caption>
            <tbody>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Pristine</th>
                    <th>Created at</th>
                </tr>
                {#each data.footprints as fp}
                    <tr>
                        <td>{fp.uuid}</td>
                        <td>{fp.email}</td>
                        <td>{fp.isPristine}</td>
                        <td>{formatDateToLocal(fp.createdAt)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .admin {
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
        border-bottom: 2px solid var(--app-black);
        font-size: 0.75rem;
        font-weight: normal;
        white-space: nowrap;
    }

    tr:nth-child(odd) {
        background-color: var(--light-grey);
    }
</style>
