import { writable } from 'svelte/store'

export const grecaptchaStore = writable<string | null>(null)
