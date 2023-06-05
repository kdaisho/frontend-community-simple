import { type Actions, redirect } from '@sveltejs/kit'
import { client } from '$lib/trpc'

interface File {
    arrayBuffer: () => Promise<ArrayBuffer>
    name: string
    type: string
}

export const actions = {
    uploadFile: async event => {
        const formData = await event.request.formData()
        const file = formData.getAll('files')?.[0] as File
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        try {
            client.upload.query({
                file: buffer,
                name: file.name,
                mimetype: file.type,
            })

            return { success: true, message: 'file uploaded successfully' }
        } catch (err) {
            return { success: false, message: 'file upload failed' }
        }
    },
    downloadFile: async event => {
        const formData = await event.request.formData()
        const filename = formData.get('filename') as string

        try {
            const response = await client.download.query({
                filename,
            })

            if (response?.success) {
                try {
                    console.log('250 ==>', 'redirecting')
                    throw redirect(302, '/')
                } catch (err) {
                    console.log('Redirect failed ==>', err)
                }
            }
        } catch (err) {
            return { success: false, message: 'file download failed' }
        }
    },
} satisfies Actions
