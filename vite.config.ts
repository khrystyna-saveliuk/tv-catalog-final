import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rolldownOptions: {
            input: {
                main: 'index.html',
                library: 'library.html',
                show: 'show.html',
            },
        },
    },
});