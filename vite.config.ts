import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
// import { libInjectCss } from "vite-plugin-lib-inject-css";
import path from "path";

export default defineConfig({
  plugins: [vue(), dts({ insertTypesEntry: true })], //, libInjectCss()
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "JalaliDateTimePicker",
      fileName: (format) => `jalali-datetime-picker.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["vue", "jalaali-js"],
      output: {
        globals: {
          vue: "Vue",
          "jalaali-js": "jalaaliJs",
        },
      },
    },
    cssCodeSplit: true,
    outDir: "dist",
    emptyOutDir: true,
  },
});
