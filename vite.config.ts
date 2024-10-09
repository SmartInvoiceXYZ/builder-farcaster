import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// Export Vite configuration
export default defineConfig({
  plugins: [
    // Support for TypeScript path aliases
    tsconfigPaths(),
  ],
  build: {
    target: 'node22',
    lib: {
      entry: './src/index.ts',
      formats: ['es'], // Output as ES module for consistency
      fileName: `index`,
    },
    rollupOptions: {
      // Prevent bundling dependencies
      external: ['dotenv', 'pino', '@prisma/client'],
    },
    outDir: 'dist', // Output directory
  },
})
