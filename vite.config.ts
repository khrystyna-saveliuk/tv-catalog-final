import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rolldownOptions: {
            input: {
                main: 'index.html',
                catalog: 'catalog.html',
                show: 'show.html',
            },
        },
    },
});