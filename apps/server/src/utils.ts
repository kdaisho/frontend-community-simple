import { ServerClient } from 'postmark'

const mailClient = new ServerClient(process.env.POSTMARK_API_TOKEN || '')

export async function sendEmail({
    email,
    subject,
    body,
}: {
    email: string
    subject: string
    body: string
}) {
    return await mailClient.sendEmail({
        From: 'admin@daishodesign.com',
        To: email,
        Subject: subject,
        HtmlBody: body,
    })
}

export function getUint8ArrayFromArrayLikeObject(
    stringifiedObject: { [s: string]: number } | ArrayLike<number>
) {
    return Uint8Array.from(Object.values(stringifiedObject))
}
