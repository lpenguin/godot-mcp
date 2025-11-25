import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        '@modelcontextprotocol/sdk/server/index.js',
        '@modelcontextprotocol/sdk/server/stdio.js',
        '@modelcontextprotocol/sdk/types.js',
        'net',
      ],
      output: {
        banner: '#!/usr/bin/env node',
        preserveModules: false,
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'node20',
    minify: false,
    ssr: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
