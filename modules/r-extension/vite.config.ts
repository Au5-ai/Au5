import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        sidePanel: resolve(process.cwd(), "src/sidePanel/sidepanel.html"),
        background: resolve(process.cwd(), "src/background.ts"),
        content: resolve(process.cwd(), "src/content.ts"),
      },
      output: {
        entryFileNames: (chunk: any) => {
          if (chunk.name === "background" || chunk.name === "content") {
            return `src/${chunk.name}.js`;
          }
          return `src/[name]/[name].js`;
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo: any) => {
          if (assetInfo?.name === "sidepanel.css") {
            return "src/sidePanel/sidepanel.css";
          }
          if (assetInfo?.name === "content.css") {
            return "src/content.css";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    copyPublicDir: false,
  },
  publicDir: "public",
});
