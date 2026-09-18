/// <reference types="vite/client" />
import { fileURLToPath } from "node:url"
import path from "path"

import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: "/",
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true
    }),
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src")
    }
  },
  server: {
    proxy: {
      // Mirrors the rewrite the hosting platform applies in production, so the API is same-origin
      // in development too and the two environments cannot drift apart.
      "/leads-crm": {
        target: process.env.VITE_DEV_API_TARGET ?? "http://localhost:8090",
        changeOrigin: true
      },
      // Engageto's WhatsApp API has no CORS allowance for a browser origin, so the browser cannot
      // call it directly in dev. Proxying it same-origin sidesteps that; changeOrigin makes
      // Engageto see its own host in the Host header rather than localhost.
      "/engageto-api": {
        target: "https://connect.engageto.in",
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/engageto-api/, "/api")
      }
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: ["@tanstack/react-query", "@tanstack/react-router", "@tanstack/react-table", "aws-amplify"]
        }
      }
    }
  }
})
