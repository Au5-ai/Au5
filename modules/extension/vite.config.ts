import { defineConfig } from "vite";
import { resolve } from "path";
import copy from "rollup-plugin-copy";
import stringPlugin from "vite-plugin-string";

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
        ui: resolve(__dirname, "src/ui/uiBundle.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "ui") return "scripts/ui.js";
          return "[name].js";
        },
        chunkFileNames: "scripts/[name].js",
        assetFileNames: "[name].[ext]",
        manualChunks: () => undefined,
        preserveModules: false,
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    stringPlugin({
      include: ["**/*.raw.css"],
    }),
    copy({
      targets: [
        { src: "manifest.json", dest: "dist" },
        { src: "src/ui/sidepanel.html", dest: "dist/" },
        { src: "src/ui/styles/*", dest: "dist/styles/" },
        { src: "src/assets/*", dest: "dist/assets/" },
      ],
      hook: "writeBundle",
    }),
  ],
});
