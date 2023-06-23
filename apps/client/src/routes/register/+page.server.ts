import type { Actions, PageServerLoad } from './$types';
import { TRPCClientError } from '@trpc/client';
import { client } from '$lib/trpc';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
	return {
		user: {
			id: 'som',
			name: 'Some user'
		}
	};
}) satisfies PageServerLoad;

export const actions = {
	register: async ({ request }) => {
		const formData = await request.formData();

		const name = (formData.get('name') as string).trim();
		const email = (formData.get('email') as string).trim();

		if (!name.length) {
			return fail(422, {
				name,
				error: ['Name cannot be empty']
			});
		}

		if (!email.length) {
			return fail(422, {
				email,
				error: ['Email cannot be empty']
			});
		}

		try {
			await client.register.query({ name, email });
			return { success: true };
		} catch (err) {
			if (err instanceof TRPCClientError) {
				const errors = JSON.parse(err.message);
				return fail(422, {
					name,
					email,
					error: errors.map((e: { message: string }) => e.message)
				});
			}
		}
	}
} satisfies Actions;
