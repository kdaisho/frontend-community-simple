<script lang="ts">
    import { superForm } from 'sveltekit-superforms'
    import type { PageData } from './$types'

    export let data: PageData

    // const { form, errors, enhance } = superForm(defaults(zod(sheetSchema)), {
    //     id: 'my-sheet',
    //     dataType: 'json',
    // })

    const { form, errors, enhance } = superForm(data.form, {
        id: 'my-sheet',
        dataType: 'json',
    })

    $: console.log('==>', { $form })
    $: console.log('==>', { $errors })
</script>

<!-- <SuperDebug data={{ form, errors }} /> -->

<div class="sheet-page">
    <header>
        <h1>Sheet</h1>
    </header>

    <main>
        <table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Amount</th>
                </tr>
            </thead>

            <tbody>
                {#each $form.items as f}
                    <tr>
                        <td>
                            <input type="text" name="email" value={f.email} />
                        </td>
                        <td>
                            <input type="number" name="amount" value={f.amount} />
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </main>
</div>

<style>
    .sheet-page {
        display: grid;
        gap: 1rem;
    }

    table {
        text-align: left;
    }
</style>
