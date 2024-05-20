import { ref, watch, nextTick } from "vue"
import type { FieldType, IFieldMeta, ITable } from "@lark-base-open/js-sdk"
import { useTableList } from "./useTableList"
// import { tryOnMounted } from "@/utils"

export function useTableMetaList(
	fieldType: FieldType | undefined = undefined
) {
	const tableList = useTableList()
	const tableMetaList = ref<{
		id: string
		name: string
		fieldMetaList: IFieldMeta[]
		table: ITable
		// viewMetaList: IViewMeta[]
	}[]>([])
	function getTableMetaList() {
		return Promise.all(tableList.value.map(async table => {
			const name = await table.getName()
			const fieldMetaList = fieldType
				? await table.getFieldMetaListByType(fieldType)
				: await table.getFieldMetaList()
			// const viewMetaList = await table.getViewMetaList()
			return {
				name,
				id: table.id,
				fieldMetaList,
				table,
				// viewMetaList,
			}
		}))
	}
	watch(tableList, () => {
		getTableMetaList().then((metaList) => {
			nextTick(() => {
				tableMetaList.value = metaList
			})
		}).catch((e) => {
			console.error(e)
		})
	}, { immediate: true })
	return tableMetaList
}