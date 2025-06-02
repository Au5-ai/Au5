import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2020",
    minify: false,
    lib: {
      entry: "src/program.ts",
      formats: ["cjs"],
      fileName: () => "program.js",
    },
    rollupOptions: {
      output: {
        compact: false,
      },
    },
  },
});
