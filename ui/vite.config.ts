import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build:{
    rollupOptions:{
      input:{
        main: path.resolve(__dirname,'index.html')
      }
    }
  },
  server:{
    proxy:{
      "/api" : "http://localhost:3000"
    }
  }
})
