import { z } from 'zod'
import { publicProcedure, router } from '../../../trpc'
import { handleDownload, handleUpload } from './dao'

const uploadPayload = z.object({
    file: z.any(),
    name: z.string(),
    mimetype: z.string(),
})

const downloadPayload = z.object({
    filename: z.string(),
})

export const fileRouter = router({
    Upload: publicProcedure.input(uploadPayload).query(async ({ input }) => {
        await handleUpload({
            file: input.file,
            fileName: input.name,
            mimeType: input.mimetype,
        })
    }),
    Download: publicProcedure.input(downloadPayload).query(async ({ input }) => {
        return await handleDownload({ fileName: input.filename })
    }),
})
