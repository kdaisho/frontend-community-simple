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
    console.log('==> sending email', url)
    // return await mailClient.sendEmail({
    //     From: 'admin@daishodesign.com',
    //     To: email,
    //     Subject: subject,
    //     HtmlBody: body,
    // })
}

export function getCredentialIdFromStringifiedDevices(
    stringifiedObject: { [s: string]: number } | ArrayLike<number>
) {
    console.log(
        '==> getCredentialIdFromStringifiedDevices',
        Array.isArray(stringifiedObject),
        stringifiedObject
    )
    return Uint8Array.from(Object.values(stringifiedObject))
}
