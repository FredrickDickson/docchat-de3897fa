import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Enable polyfills for Node.js built-in modules
      protocolImports: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix for LangChain dependency issues
      "camelcase": path.resolve(__dirname, "./src/lib/polyfills.ts"),
      "decamelize": path.resolve(__dirname, "./src/lib/polyfills.ts"),
    },
  },
  optimizeDeps: {
    exclude: ['@langchain/core', '@langchain/openai', '@langchain/textsplitters'],
    include: ['p-queue', 'semver'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
    },
  },
}));
