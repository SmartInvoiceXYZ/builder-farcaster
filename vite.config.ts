import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// Export Vite configuration
export default defineConfig({
  plugins: [
    // Support for TypeScript path aliases
    tsconfigPaths(),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'], // Output as ES module for consistency
      fileName: `index.mjs`,
    },
    rollupOptions: {
      // Prevent bundling dependencies
      external: ['dotenv', 'pino'],
    },
    outDir: 'dist', // Output directory
  },
})
