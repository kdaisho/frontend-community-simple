import type { Actions, PageServerLoad } from './$types';
import { TRPCClientError } from '@trpc/client';
import { client } from '$lib/trpc';
import { fail } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	console.log('LOAD SignIn ==>', params);
}) satisfies PageServerLoad;

export const actions = {
	signIn: async ({ request }) => {
		const formData = await request.formData();
		const email = (formData.get('email') as string).trim();

		if (!email.length) {
			return fail(422, {
				email,
				error: ['Email cannot be empty']
			});
		}

		try {
			await client.signIn.query({ email });
			return { success: true };
		} catch (err) {
			if (err instanceof TRPCClientError) {
				const errors = JSON.parse(err.message);
				return fail(422, {
					email,
					error: errors.map((e: { message: string }) => e.message)
				});
			}
			return { success: false, message: 'Failed to sign in' };
		}
	}
} satisfies Actions;
