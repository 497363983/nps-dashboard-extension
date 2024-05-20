import path from "path"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import semi from "@kousum/vite-plugin-semi-theme"


export default defineConfig({
    plugins: [
		vue(),
        semi({
            theme: "@semi-bot/semi-theme-feishu-dashboard"
        })
    ],
	resolve: {
		alias: {
		  "@": path.resolve(__dirname, "./src"),
		},
	  },
})