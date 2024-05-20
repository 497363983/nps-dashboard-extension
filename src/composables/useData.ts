import { MaybeRefOrGetter, shallowRef, toValue, watch } from "vue"
import type { IConfig, IData, IDataCondition } from "@lark-base-open/js-sdk"
import { DashboardState, bitable } from "@lark-base-open/js-sdk"
import { useState } from "./useState"
import { tryOnMounted, tryOnUnMounted } from "@/utils"

export function useData<T = IData>(
	config: MaybeRefOrGetter<IConfig | undefined>,
	parseData: (raw: IData) => T[]
) {
	const data = shallowRef<T[]>([])
	const state = useState()
	const getDataMethod = (condition: IDataCondition) => {
		if (![DashboardState.Config, DashboardState.Create].includes(toValue(state))) return bitable.dashboard.getData()
		return bitable.dashboard.getPreviewData(condition)
	}

	const off = bitable.dashboard.onDataChange((ctx) => {
		data.value = parseData(ctx.data)
	})

	const getData = async () => {
		const rawCondition = toValue(config)?.dataConditions?.[0]
		if (!rawCondition) return
		const condition = JSON.parse(JSON.stringify(toValue(config)?.dataConditions?.[0])) as IDataCondition
		console.log("condition", condition)
		if (!condition || !condition.tableId) return
		const raw = await getDataMethod(condition)
		data.value = parseData(raw)
	}
	tryOnMounted(getData, false)
	tryOnUnMounted(off)
	watch(
		() => toValue(config),
		() => {
			getData()
		},
		{ immediate: true, deep: true}
	)

	return data
}