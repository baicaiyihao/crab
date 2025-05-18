/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // 确保包含入口 HTML 文件
    "./src/**/*.{js,ts,jsx,tsx}", // 包括所有 React 和 TypeScript 文件
    "./src/*.{js,ts,jsx,tsx}", // 包括所有 React 和 TypeScript 文件
  ],
  theme: {
    extend: {}, // 你可以在这里自定义主题
  },
  plugins: [], // 添加需要的 Tailwind 插件
};
