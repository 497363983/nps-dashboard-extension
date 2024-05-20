import { getCurrentInstance, nextTick, onUnmounted } from "vue"

export function tryOnUnMounted(fn: () => void, sync = true) {
	const instance = getCurrentInstance()
	if (instance) onUnmounted(fn, instance)
	else if (sync) fn()
	else nextTick(fn)
}