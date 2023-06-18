import type { Actions, PageServerLoad } from './$types'
import { TRPCClientError } from '@trpc/client'
import { client } from '$lib/trpc'
import { handleTrpcClientError } from '$lib/utils'

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
            return { success: false, errors: { name: 'Name cannot be empty' } }
        }

        if (!email.length) {
            return {
                success: false,
                errors: { email: 'Email cannot be empty' },
            }
        }

        try {
            await client.register.query({ name, email })
            return { success: true }
        } catch (err) {
            if (err instanceof TRPCClientError) {
                return handleTrpcClientError(err)
            }
            return { success: false, message: 'Failed to register' }
        }
    },
} satisfies Actions
