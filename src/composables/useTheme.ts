import { bitable, ThemeModeType } from "@lark-base-open/js-sdk"
import { ref } from "vue"
import { tryOnMounted, tryOnUnMounted } from "@/utils"

export function useTheme() {
	const theme = ref<ThemeModeType>(ThemeModeType.LIGHT)
	const stop = bitable.bridge.onThemeChange((mode) => {
		theme.value = mode.data.theme
	})
	tryOnMounted(() => {
		bitable.bridge.getTheme().then((mode) => {
			theme.value = mode
		})
	})
	tryOnUnMounted(() => {
		stop()
	})
	return theme
}