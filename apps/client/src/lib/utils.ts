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

export function handleTrpcClientError(err: any) {
    type ErrorProps = {
        path: string[]
        message: string
    }
    type ClientCustomError = {
        [k: string]: string
    }

    const errors = JSON.parse(err.message).reduce(
        (acc: ClientCustomError, cur: ErrorProps) => {
            return { ...acc, [cur.path[0]]: cur.message }
        },
        {}
    )
    return { success: false, errors }
}
