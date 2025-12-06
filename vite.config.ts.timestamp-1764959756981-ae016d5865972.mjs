// vite.config.ts
import { defineConfig } from "file:///C:/Users/Administrator/Documents/Projects/docchat-de3897fa/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Documents/Projects/docchat-de3897fa/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Administrator/Documents/Projects/docchat-de3897fa/node_modules/lovable-tagger/dist/index.js";
import { nodePolyfills } from "file:///C:/Users/Administrator/Documents/Projects/docchat-de3897fa/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Documents\\Projects\\docchat-de3897fa";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      // Enable polyfills for Node.js built-in modules
      protocolImports: true
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      // Fix for LangChain dependency issues
      "camelcase": path.resolve(__vite_injected_original_dirname, "./src/lib/polyfills.ts"),
      "decamelize": path.resolve(__vite_injected_original_dirname, "./src/lib/polyfills.ts")
    }
  },
  optimizeDeps: {
    exclude: ["@langchain/core", "@langchain/openai", "@langchain/textsplitters"],
    include: ["p-queue", "semver"],
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXERvY3VtZW50c1xcXFxQcm9qZWN0c1xcXFxkb2NjaGF0LWRlMzg5N2ZhXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXERvY3VtZW50c1xcXFxQcm9qZWN0c1xcXFxkb2NjaGF0LWRlMzg5N2ZhXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yL0RvY3VtZW50cy9Qcm9qZWN0cy9kb2NjaGF0LWRlMzg5N2ZhL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgICBub2RlUG9seWZpbGxzKHtcclxuICAgICAgLy8gRW5hYmxlIHBvbHlmaWxscyBmb3Igc3BlY2lmaWMgZ2xvYmFscyBhbmQgbW9kdWxlc1xyXG4gICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgQnVmZmVyOiB0cnVlLFxyXG4gICAgICAgIGdsb2JhbDogdHJ1ZSxcclxuICAgICAgICBwcm9jZXNzOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgICAvLyBFbmFibGUgcG9seWZpbGxzIGZvciBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZXNcclxuICAgICAgcHJvdG9jb2xJbXBvcnRzOiB0cnVlLFxyXG4gICAgfSksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICAgIC8vIEZpeCBmb3IgTGFuZ0NoYWluIGRlcGVuZGVuY3kgaXNzdWVzXHJcbiAgICAgIFwiY2FtZWxjYXNlXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvbGliL3BvbHlmaWxscy50c1wiKSxcclxuICAgICAgXCJkZWNhbWVsaXplXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvbGliL3BvbHlmaWxscy50c1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGV4Y2x1ZGU6IFsnQGxhbmdjaGFpbi9jb3JlJywgJ0BsYW5nY2hhaW4vb3BlbmFpJywgJ0BsYW5nY2hhaW4vdGV4dHNwbGl0dGVycyddLFxyXG4gICAgaW5jbHVkZTogWydwLXF1ZXVlJywgJ3NlbXZlciddLFxyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgZGVmaW5lOiB7XHJcbiAgICAgICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcydcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRXLFNBQVMsb0JBQW9CO0FBQ3pZLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxxQkFBcUI7QUFKOUIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsSUFDMUMsY0FBYztBQUFBO0FBQUEsTUFFWixTQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsTUFDWDtBQUFBO0FBQUEsTUFFQSxpQkFBaUI7QUFBQSxJQUNuQixDQUFDO0FBQUEsRUFDSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQTtBQUFBLE1BRXBDLGFBQWEsS0FBSyxRQUFRLGtDQUFXLHdCQUF3QjtBQUFBLE1BQzdELGNBQWMsS0FBSyxRQUFRLGtDQUFXLHdCQUF3QjtBQUFBLElBQ2hFO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLG1CQUFtQixxQkFBcUIsMEJBQTBCO0FBQUEsSUFDNUUsU0FBUyxDQUFDLFdBQVcsUUFBUTtBQUFBLElBQzdCLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
