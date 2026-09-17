import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: "src/content/main.ts",
      output: {
        entryFileNames: "content.js",
        format: "iife",
        inlineDynamicImports: true
      }
    }
  },
  publicDir: "public"
});
