// idk why i have to declare these to satisfy the compiler for '$env/static/private'
declare module '$env/static/private' {
    export const RECAPTCHA_SECRET_KEY: string
    export const JWT_SIGNATURE: string
    export const ADMIN_EMAIL: string
}
