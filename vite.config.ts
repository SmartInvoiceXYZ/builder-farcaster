import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import packageJson from './package.json' // Import the package.json file

// Combine dependencies and devDependencies if needed
const externalDeps = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
]

export default defineConfig({
  plugins: [
    // Support for TypeScript path aliases
    tsconfigPaths(),
  ],
  build: {
    target: 'es2022', // Align with ES target for clarity
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'], // ES and CommonJS for compatibility
      fileName: 'index',
    },
    rollupOptions: {
      treeshake: true, // Ensure tree-shaking is on
      external: externalDeps, // Use dynamically imported dependencies
    },
    outDir: 'dist', // Output directory
    emptyOutDir: true, // Clean output directory before builds
  },
})
