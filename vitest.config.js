import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: './server/test/setupTest.js'
    }
});
