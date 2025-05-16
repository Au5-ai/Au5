import { defineConfig } from "vite";
import { resolve } from "path";
import copy from "rollup-plugin-copy";

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
        injected: resolve(__dirname, "src/injected.ts"),
      },
      output: {
        manualChunks: () => null,
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    copy({
      targets: [
        { src: "manifest.json", dest: "dist" },
        { src: "src/ui/template.html", dest: "dist/ui/" },
        { src: "src/assets/*", dest: "dist/assets/" },
      ],
      hook: "writeBundle",
    }),
  ],
});
