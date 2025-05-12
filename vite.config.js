import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  esbuild: {
    loader: { ".js": "jsx" }, // Make sure .js files are treated as JSX
    // include: /src\/.*\.js$/, // Apply this loader to all .js files in the src folder
    include: /[\\/]src[\\/].*\.js$/, // ✅ Includes files in src and subfolders
    exclude: /node_modules/,
  },
});
