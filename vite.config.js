import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src'
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true
            }
        }
    },
    server: {
        open: true,
        port: 3000
    }
});
