import type { PageServerLoad } from './$types'
import { client } from '$lib/trpc'
import { redirect } from '@sveltejs/kit'

export const load = (async ({ params }) => {
    const filename = params.filename

    try {
        const response = await client.download.query({
            filename,
        })

        console.log('SV ==>', response)

        if (response?.success) {
            try {
                console.log('100 ==>', 'redirecting')
                throw redirect(307, response.url)
            } catch (err) {
                console.log('Redirect failed ==>', err)
            }
        }
    } catch (err) {
        return { success: false, message: 'file download failed' }
    }
}) satisfies PageServerLoad
