import { bitable, IConfig, DashboardState } from "@lark-base-open/js-sdk"
import { ref } from "vue"
import { tryOnMounted, tryOnUnMounted } from "@/utils"
import { useState } from "./useState"

export function useConfig() {
	const state = useState()
	const config = ref<IConfig>()
	const off = state.value !== DashboardState.Create ? bitable.dashboard.onConfigChange((ctx) => {
		config.value = ctx.data
	}) : () => undefined
	const save = (config: IConfig) => {
		const conf = JSON.parse(JSON.stringify(config))
		bitable.dashboard.saveConfig(conf)
	}
	tryOnMounted(async () => {
		if (state.value !== DashboardState.Create) {
			const conf = await bitable.dashboard.getConfig()
			config.value = conf
		}
	}, false)
	tryOnUnMounted(off)
	return { config, save }
}