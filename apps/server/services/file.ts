import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    region: process.env.AWS_BUCKET_REGION,
})

type HandleUploadProps = {
    file: ArrayBuffer
    fileName: string
    mimeType: string
}

type HandleDownloadProps = {
    fileName: string
}

export async function handleUpload({ file, fileName, mimeType }: HandleUploadProps) {
    const buffer = Buffer.from(file)
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType,
    })

    try {
        await s3Client.send(command)
        return { success: true }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong'
        console.error(message)
    }
}

export async function handleDownload({ fileName }: HandleDownloadProps) {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        ResponseContentDisposition: 'attachment',
    })

    try {
        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
        })
        console.log('==>', { signedUrl })
        return { success: true, url: signedUrl }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Download failed'
        console.error(message)
    }
}
