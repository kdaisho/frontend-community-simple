import type { Actions, PageServerLoad } from './$types'
import { client } from '$lib/trpc'

export const load = (async ({ params }) => {
    console.log('LOAD SignIn ==>', params)
}) satisfies PageServerLoad

export const actions = {
    signIn: async ({ request }) => {
        console.log('==> Boom', request)

        const formData = await request.formData()
        const email = (formData.get('email') as string).trim()

        if (!email.length) {
            return { success: false, message: 'Username cannot be empty' }
        }

        console.log('==> Boom 2', email)

        try {
            await client.signIn.query({ email })
            return { success: true }
        } catch (err) {
            console.error('==> Boom Error', err)
        }
    },
} satisfies Actions
