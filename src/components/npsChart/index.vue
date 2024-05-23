<script lang="ts" setup>
import { IConfig } from "@lark-base-open/js-sdk"
import { useI18n } from "vue-i18n"
import { useData } from "@/composables"
import { NPSRole, CustomConfig } from "@/types"
import { useNPSChart, NPSDataItem } from "./useNPSChart"
import { getRole, getInitRoleRange } from "@/utils"
import { Table, Row, Col, type ColumnProps } from "@kousum/semi-ui-vue"
import { computed } from "vue"
import { useWindowSize } from "@vueuse/core"

const props = defineProps<{
	config?: IConfig
}>()
const { t } = useI18n()
const { height: winHeight } = useWindowSize()

const data = useData(
	() => props.config,
	(raw, config) => {
		if (!config) return []
		const customConfig = config?.customConfig as CustomConfig | undefined
		if (!customConfig) return []
		if (!customConfig.scoreRange) return []
		const _data: Record<NPSRole, number> = {
			[NPSRole.Detractor]: 0,
			[NPSRole.Passive]: 0,
			[NPSRole.Promoter]: 0,
		}
		const scoreNum = customConfig.scoreRange[1] - customConfig.scoreRange[0] + 1
		const roleRange =
			customConfig.roleRange ?? (getInitRoleRange(scoreNum) as [number, number])
		raw.forEach((item, index) => {
			if (index === 0) return
			const value = item[0].value
			if (value === null) return
			const role = getRole(Number(value), roleRange, customConfig.scoreRange[0])
			_data[role] += Number(item[1].value)
		})
		const val = Object.values(_data)
		const sum = val.reduce((acc, cur) => acc + cur, 0)
		return [
			{
				role: t(`npsRole.${NPSRole.Detractor}`),
				value: -100 + (200 * _data[NPSRole.Detractor]) / sum,
				num: _data[NPSRole.Detractor],
				type: NPSRole.Detractor,
			},
			{
				role: t(`npsRole.${NPSRole.Passive}`),
				value:
					-100 +
					(200 * (_data[NPSRole.Passive] + _data[NPSRole.Detractor])) / sum,
				num: _data[NPSRole.Passive],
				type: NPSRole.Passive,
			},
			{
				role: t(`npsRole.${NPSRole.Promoter}`),
				value: 100,
				num: _data[NPSRole.Promoter],
				type: NPSRole.Promoter,
			},
		] as NPSDataItem[]
	},
)
const { height, width } = useNPSChart("#nps-chart", data)
const chartHeight = computed(() => {
	return height.value / 2 + 20
})

const columns = () => {
	return [
		{
			title: t("table.options"),
			dataIndex: "Options",
			align: "left",
		},
		{
			title: t("table.number"),
			dataIndex: "Number",
			align: "center",
		},
		{
			title: t("table.percent"),
			dataIndex: "Percent",
			align: "right",
		},
	] as ColumnProps[]
}
const tableData = computed(() => {
	const total = data.value.reduce((acc, cur) => acc + cur.num, 0)
	const roleRange = props.config?.customConfig?.roleRange
		? (props.config.customConfig.roleRange as [number, number])
		: getInitRoleRange(3)
	const scoreRange = props.config?.customConfig?.scoreRange
		? (props.config.customConfig.scoreRange as [number, number])
		: [1, 3]
	console.log("roleRange", roleRange, "scoreRange", scoreRange)
	const threshold = {
		[NPSRole.Detractor]: [
			scoreRange?.[0],
			roleRange?.[0] - (scoreRange?.[0] === 1 ? 0 : 1),
		],
		[NPSRole.Passive]: [
			roleRange?.[0] - -(scoreRange?.[0] === 1 ? 0 : 1),
			roleRange?.[1] - scoreRange?.[0],
		],
		[NPSRole.Promoter]: [roleRange?.[1] - scoreRange?.[0] + 1, scoreRange?.[1]],
	}
	return data.value.map((item) => {
		return {
			Options: `${item.role}（${threshold[item.type]?.[0] === threshold[item.type]?.[1] ? "" : threshold[item.type]?.[0] + "-"}${threshold[item.type]?.[1]}${t("table.score")}）`,
			Number: item.num,
			Percent: `${((item.num / total) * 100).toFixed(2)}%`,
		}
	})
})
</script>

<template>
	<div class="chart-container">
		<Row>
			<Col
				:span="24"
				align="center"
			>
				<div style="max-height: 100vh; overflow: auto">
					<div
						:style="{
							// position: 'relative',
							height: chartHeight + 'px',
							overflow: 'hidden',
							// maxHeight: '100vh',
							// transform: winWidth <= winHeight ? 'translateY(-50%)' : 'translateY(0)',
							transform: `translateY(-${(chartHeight - (width + 40) / 2) / 2}px)`,
						}"
					>
						<div id="nps-chart"></div>
					</div>
				</div>
			</Col>
			<Col
				:span="24"
				align="center"
				v-if="config?.customConfig?.showTable && winHeight > 238"
			>
				<Table
					:columns="columns()"
					className="nps-table"
					:dataSource="tableData"
					:pagination="false"
				></Table>
			</Col>
		</Row>
	</div>
</template>

<style scoped>
.chart-container {
	width: 100%;
	width: 100%;
	position: relative;
}
.nps-table {
	width: 80%;
	margin-top: 20px;
}
.nps-table,
.nps-table :deep(*),
.nps-table :deep(.semi-table-row-head) {
	background: transparent;
	background-color: transparent;
}
</style>
