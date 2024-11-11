// idk why i have to declare these to satisfy the compiler for '$env/static/private'
declare module '$env/static/private' {
    export const BASE_URL: string
    export const RECAPTCHA_SECRET_KEY: string
    export const JWT_SIGNATURE: string
    export const ADMIN_EMAIL: string

    export const OAUTH_CLIENT_ID: string
    export const OAUTH_CLIENT_SECRET: string

    export const CLOUD_INSTANCE: string
    export const TENANT_ID: string
    export const CLIENT_ID: string
    export const CLIENT_SECRET: string
    export const REDIRECT_URI: string
}
