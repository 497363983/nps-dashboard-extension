import { bitable, type ITable } from "@lark-base-open/js-sdk"
import { shallowRef } from "vue"
import { tryOnMounted } from "@/utils"

export function useTableList() {
	const tableList = shallowRef<ITable[]>([])
	tryOnMounted(() => {
		bitable.base.getTableList().then((tables) => {
			tableList.value = tables
		}).catch((e) => {
			console.error(e)
		})
	}, false)

	return tableList
}