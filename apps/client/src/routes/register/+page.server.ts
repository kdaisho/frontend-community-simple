import type { Actions, PageServerLoad } from './$types'
import { TRPCClientError } from '@trpc/client'
import { client } from '$lib/trpc'

export const load = (async () => {
    return {
        user: {
            id: 'som',
            name: 'Some user',
        },
    }
}) satisfies PageServerLoad

export const actions = {
    register: async ({ request }) => {
        const formData = await request.formData()

        const name = (formData.get('name') as string).trim()
        const email = (formData.get('email') as string).trim()

        if (!name.length) {
            return { success: false, message: 'Name cannot be empty' }
        }

        if (!email.length) {
            return { success: false, message: 'Email cannot be empty' }
        }

        try {
            await client.register.query({ name, email })
            return { success: true }
        } catch (err) {
            const message =
                err instanceof TRPCClientError
                    ? err.message
                    : 'Something went wrong.'

            return { success: false, message }
        }
    },
} satisfies Actions
