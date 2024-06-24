import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, type UserConfig } from 'vite'

interface UserConfigWithTest extends UserConfig {
    test?: {
        include: string[]
        globals: boolean
        environment: 'jsdom' | 'node'
        setupFiles: string[]
    }
}

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        port: 5173,
    },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./setupTest.ts'],
    },
} as UserConfigWithTest)
