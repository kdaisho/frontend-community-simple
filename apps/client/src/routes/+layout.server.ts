import type { LayoutServerLoad } from './$types'
import { client } from '../lib/trpc'

export const load = (() => {
    console.log('TRPC Client ==>', client)

    client.getTodos.query({ filter: true }).then(res => {
        console.log('res ==>', res)
    })

    // client.createTodo
    //     .query({ title: 'Hello World2', completed: false })
    //     .then(res => {
    //         console.log('res ==>', res)
    //     })

    return {
        post: {
            title: 'Hello World',
            content: 'Content daze!',
        },
    }
}) satisfies LayoutServerLoad
