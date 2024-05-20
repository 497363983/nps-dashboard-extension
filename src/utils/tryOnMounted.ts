import { getCurrentInstance, onMounted, nextTick } from "vue"

/**
 * Call onMounted() if it's inside a component lifecycle, if not, just call the function.
 *
 * @see https://github.com/vueuse/vueuse/blob/main/packages/shared/tryOnMounted/index.ts
 * @param fn
 * @param sync
 */
export function tryOnMounted(fn: () => void, sync = true) {
  const instance = getCurrentInstance()
  if (instance) onMounted(fn, instance)
  else if (sync) fn()
  else nextTick(fn)
}