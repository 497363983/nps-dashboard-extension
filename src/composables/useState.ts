import { bitable, DashboardState } from "@lark-base-open/js-sdk"
import { ref } from "vue"

export function useState() {
	const state = ref<DashboardState>(bitable.dashboard.state)
	return state
}