import { ServerClient } from 'postmark'

const mailClient = new ServerClient(process.env.POSTMARK_API_TOKEN || '')

export async function sendEmail({
    email,
    subject,
    body,
    url,
}: {
    email: string
    subject: string
    body: string
    url?: string
}) {
    console.log(url)

    if (!email.includes('+')) {
        console.error('security: invalid email address')
        return
    }

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
