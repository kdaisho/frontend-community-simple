import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { sheetSchema } from './schema';

export const load = (async () => {
    // const form = await superValidate({ items: [{ email: 'daisho@me.com', amount: 0 }] }, zod(sheetSchema));
    const form = await superValidate({ items: [{ email: '', amount: 0 }] }, zod(sheetSchema));

    console.log('==> sv', form)

    return { form }
}) satisfies PageServerLoad

// export const actions = {
// } satisfies Actions
