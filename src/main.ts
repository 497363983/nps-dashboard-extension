import App from "./App.vue"
import { createApp } from "vue"
import { i18n } from "./locale"
import { initVChartSemiTheme } from "@visactor/vchart-semi-theme"

initVChartSemiTheme({
	isWatchingMode: true
})

const app = createApp(App)

app.use(i18n).mount("#app")