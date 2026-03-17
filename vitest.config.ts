import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@\/convex\/(.*)$/,
        replacement: path.resolve(__dirname, "./convex/$1"),
      },
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, "./src/$1"),
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
