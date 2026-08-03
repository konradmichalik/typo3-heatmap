import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        include: ['Tests/JavaScript/**/*.test.ts'],
        environment: 'node',
    },
});
