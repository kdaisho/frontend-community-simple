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
    console.log('==>', 'sending email', email, subject)
    return await mailClient.sendEmail({
        From: 'admin@daishodesign.com',
        To: email,
        Subject: subject,
        HtmlBody: body,
    })
}
