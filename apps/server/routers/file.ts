import { handleDownload, handleUpload } from '../services/file'
import { publicProcedure, router } from '../trpc'
import { z } from 'zod'

const uploadPayload = z.object({
    file: z.any(),
    name: z.string(),
    mimetype: z.string(),
})

const downloadPayload = z.object({
    filename: z.string(),
})

export const fileRouter = router({
    upload: publicProcedure.input(uploadPayload).query(async ({ input }) => {
        await handleUpload({
            file: input.file,
            fileName: input.name,
            mimeType: input.mimetype,
        })
    }),
    download: publicProcedure.input(downloadPayload).query(async ({ input }) => {
        return await handleDownload({ fileName: input.filename })
    }),
})
