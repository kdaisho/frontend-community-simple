import { RECAPTCHA_SECRET_KEY } from '$env/static/private'

export function debounce<T>(fn: (req: T) => void, interval: number) {
    let timeoutId: ReturnType<typeof setTimeout>

    return (request: T) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            fn(request)
        }, interval)
    }
}

export async function validateHumanInteraction(token: string) {
    try {
        const response = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        return await response.json()
    } catch (err) {
        return { success: false, msg: 'Something went wrong.' }
    }
}
