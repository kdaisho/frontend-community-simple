import type { Actions, PageServerLoad } from './$types'
import { TRPCClientError } from '@trpc/client'
import { client } from '$lib/trpc'
import { handleTrpcClientError } from '$lib/utils'

export const load = (async ({ params }) => {
    console.log('LOAD SignIn ==>', params)
}) satisfies PageServerLoad

export const actions = {
    signIn: async ({ request }) => {
        const formData = await request.formData()
        const email = (formData.get('email') as string).trim()

        if (!email.length) {
            return { success: false, message: 'Username cannot be empty' }
        }

        try {
            await client.signIn.query({ email })
            return { success: true }
        } catch (err) {
            if (err instanceof TRPCClientError) {
                return handleTrpcClientError(err)
            }
            return { success: false, message: 'Failed to sign in' }
        }
    },
} satisfies Actions
