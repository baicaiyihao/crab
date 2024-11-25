import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
// 使用 ESM 导入方式替代动态 require
export default defineConfig({
    plugins: [react()],
    css: {
        postcss: {
            plugins: [
                tailwindcss(), // 使用 TailwindCSS
                autoprefixer(), // 自动添加浏览器前缀
            ],
        },
    },
});
