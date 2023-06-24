import type { PageServerLoad } from './$types';

export const load = (({ url }) => {
	console.log('Handling email click ==>', url.searchParams.get('email'));
}) satisfies PageServerLoad;
