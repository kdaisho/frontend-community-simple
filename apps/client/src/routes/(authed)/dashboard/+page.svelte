<script lang="ts">
    import type { PageServerData } from './$types'

    export let data: PageServerData
</script>

<div class="dashboard">
    <h1>Dashboard</h1>

    <div class="table-container">
        <table>
            <caption>It's you.</caption>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
            </tr>

            <tr>
                <td>{data.userName}</td>
                <td>{data.email}</td>
                <td>{data.isAdmin}</td>
            </tr>
        </table>
    </div>
</div>

<style>
    .dashboard {
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
        border-bottom: 1px solid var(--app-black);
        font-size: 0.75rem;
        font-weight: normal;
        white-space: nowrap;
    }
</style>
