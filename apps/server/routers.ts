import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createTodo, deleteTodo, getTodos, updateTodo } from './services/todo'
import { initTRPC } from '@trpc/server'
import z from 'zod'

const t = initTRPC.create()

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: process.env.BUCKET_REGION as string,
})

const createTodoPayload = z.object({
    task: z.string(),
})

const updateTodoPayload = z.object({
    id: z.number(),
    task: z.string().optional(),
    completed: z.boolean().optional(),
})

const uploadPayload = z.object({
    file: z.any(),
    name: z.string(),
    mimetype: z.string(),
})

export const appRouter = t.router({
    createTodo: t.procedure.input(createTodoPayload).query(({ input }) => {
        createTodo(input)
    }),
    updateTodo: t.procedure
        .input(updateTodoPayload)
        .query(async ({ input }) => await updateTodo(input)),
    deleteTodo: t.procedure.input(z.number()).query(({ input }) => {
        deleteTodo(input)
    }),
    getTodos: t.procedure.query(async () => {
        const todos = await getTodos()
        return todos
    }),
    upload: t.procedure.input(uploadPayload).query(async ({ input }) => {
        const buffer = Buffer.from(input.file.data)
        const command = new PutObjectCommand({
            Bucket: 'file-upload-test-2',
            Key: input.name,
            Body: buffer,
            ContentType: input.mimetype,
        })

        try {
            await s3Client.send(command)
            return { success: true }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'something went wrong.'
            console.error(message)
        }
    }),
})

export type AppRouter = typeof appRouter
