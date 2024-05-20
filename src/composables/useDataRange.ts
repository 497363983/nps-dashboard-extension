import type { MaybeRefOrGetter } from "vue"
import { ref, toValue, watch } from "vue"
import { IDataRange, bitable } from "@lark-base-open/js-sdk"
import { tryOnMounted } from "@/utils"

export function useDataRange(
	tableId: MaybeRefOrGetter<string | undefined>,
) {
	const dataRange = ref<IDataRange[]>([])
	async function updateDataRange() {
		const id = toValue(tableId)
		if (!id) return
		const range = await bitable.dashboard.getTableDataRange(id)
		dataRange.value = range
	}
	watch(() => toValue(tableId), updateDataRange)
	tryOnMounted(updateDataRange, false)
	return dataRange
}