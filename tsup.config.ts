import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    splitting: false,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
    esbuildOptions(opts) {
        opts.jsx = 'automatic';
    },
});
