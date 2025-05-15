import { defineConfig } from "vite";
import { resolve } from "path";
import copy from "rollup-plugin-copy";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    copy({
      targets: [
        { src: "src/signalr.min.js", dest: "dist" },
        { src: "src/injected.js", dest: "dist" },
        { src: "manifest.json", dest: "dist" },
        { src: "src/ui/template.html", dest: "dist/ui/" },
        { src: "src/assets/*", dest: "dist/assets/" },
      ],
      hook: "writeBundle",
    }),
  ],
});
