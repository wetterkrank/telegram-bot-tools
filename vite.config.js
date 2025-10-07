import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte()],
    test: {
        globals: true,
        environment: 'jsdom',
        exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
        setupFiles: ['./src/test/setup.ts']
    },
})
