import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // /api로 시작하는 요청을 Express 서버(4000번 포트)로 전달합니다.
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
