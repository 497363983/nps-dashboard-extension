import { bitable, DashboardState } from "@lark-base-open/js-sdk"
import { tryOnMounted } from "@/utils"
import { ref } from "vue"

export function useState() {
	const state = ref<DashboardState>(bitable.dashboard.state)
	tryOnMounted(() => {
		const body = document.querySelector("body")
		if (body) {
			body.setAttribute("extension-state", state.value)
		}
	})
	return state
}