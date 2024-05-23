import { ICommonChartSpec } from "@visactor/vchart"
import VChart from "@visactor/vchart"
import { MaybeRefOrGetter, toValue, shallowRef, watch, ref, nextTick } from "vue"
import { NPSRole } from "@/types"
import { tryOnMounted, tryOnUnMounted } from "@/utils"
import { bitable } from "@lark-base-open/js-sdk"


export interface NPSDataItem {
	role: string
	type: NPSRole
	value: number
	num: number
}

const npsFillColor = {
	[NPSRole.Promoter]: "#80d066",
	[NPSRole.Passive]: "#f2a853",
	[NPSRole.Detractor]: "#e7736a"
}

const getNPS = (data: NPSDataItem[]) => {
	const total = data.reduce((acc, cur) => acc + cur.num, 0)
	const promoter = data.find((item) => item.type === NPSRole.Promoter)?.num ?? 0
	const detractor = data.find((item) => item.type === NPSRole.Detractor)?.num ?? 0
	const nps = ((promoter - detractor) / total) * 100
	return nps
}

const getMainColor = (value: number, data: NPSDataItem[]) => {
	if (value <= data[0]?.value) return npsFillColor[NPSRole.Detractor]
	if (value <= data[1]?.value) return npsFillColor[NPSRole.Passive]
	return npsFillColor[NPSRole.Promoter]
}

export function useNPSChart(
	dom: string,
	data: MaybeRefOrGetter<NPSDataItem[]>,
) {
	const chart = shallowRef<VChart>()
	const height = ref(500)
	const width = ref(500)
	const getSpec = (_data: NPSDataItem[]) => {
		const nps = getNPS(_data)
		const mainColor = getMainColor(nps, _data)
		const spec: ICommonChartSpec = {
			type: "common",
			data: [
				{
					id: "pointer",
					values: [{ role: "pointer", value: nps, radius: 2 }]
				},
				{
					id: "gauge",
					values: toValue(data)
				}
			],
			autoFit: true,
			// height: toValue(height),
			background: "transparent",
			startAngle: -180,
			endAngle: 0,
			padding: 10,
			series: [
				{
					type: "gauge",
					// regionId: "gauge",
					valueField: "value",
					dataIndex: 1,
					categoryField: "role",
					seriesField: "role",
					angleField: "value",
					outerRadius: 1,
					innerRadius: 0.9,
					startAngle: -180,
					endAngle: 0,
					// roundCap: true,
					segment: {
						style: {
							fill: {
								type: "threshold",
								field: "value",
								domain: [_data[0]?.value + 0.1, _data[1]?.value + 0.1],
								range: ["#e7736a", "#f2a853", "#80d066"]
							},
							zIndex: 200,
							// cornerRadius: 10
						},
					},
					label: {
						formatMethod: (text, item) => {
							console.log("item", item, text)
							return item?.num
						}
					},
					track: {
						visible: true,
						style: {
							cornerRadius: 100,
						}
					},
					tooltip: {
						mark: {
							content: {
								key: (d) => d?.role,
								value: (d) => d?.num
							}
						}
					},
				},
				{
					type: "gaugePointer",
					valueField: "value",
					dataIndex: 0,
					// radiusField: "radius",
					innerRadius: 0.5,
					categoryField: "role",
					tooltip: {
						visible: false
					},
					pin: {
						visible: true,
						width: 0.02,
						height: 0.02,
						isOnCenter: false,
						style: {
							fill: "#ffffff"
						}
					},
					pinBackground: {
						visible: false
					},
					pointer: {
						type: "path",
						width: 0.3,
						height: 0.3,
						isOnCenter: false,
						style: {
							fill: "#90959d"
						}
					},
				}
			],
			indicator: [
				{
					visible: true,
					offsetY: '-8%',
					title: {
						autoFit: true,
						style: {
							text: String(nps.toFixed(2)),
							// fontSize: 32,
							fontWeight: 800,
							fill: mainColor,
						}
					},
					content: [
						{
							style: {
								dy: -5,
								text: 'NPS',
								fontSize: 24,
								fill: mainColor,
							}
						}
					]
				},
			],
			axes: [
				{
					type: 'linear',
					orient: 'angle',
					label: {
						visible: true,
					},
					grid: { visible: false },
					outerRadius: 1,
					innerRadius: 0.88,
					min: -100,
					max: 100,
					inside: true,
					tick: {
						visible: true,
						tickSize: 5,
						tickStep: 20,
						style: {
							lineWidth: 2,
							lineCap: 'round',
						}
					},
					offsetY: "59%",
					subTick: { visible: true, tickSize: 1, style: { lineWidth: 2, lineCap: 'round' } },
				},
				{
					type: 'linear',
					orient: 'radius',
					outerRadius: 0.6,
					grid: { visible: false },
					label: { visible: false }
				}
			]
		}
		return spec
	}
	watch(
		() => toValue(data),
		(data) => {
			if (!chart.value) return
			chart.value.updateSpec(getSpec(data)).then(() => {
				resize()
				nextTick(bitable.dashboard.setRendered)
			})

		},
		{ immediate: true, deep: true }
	)
	const resize = () => {
		if (!chart.value) return
		const { width: w, height: h } = chart.value.getCurrentSize()
		width.value = w
		height.value = h
	}
	tryOnMounted(() => {
		const domItem = document.querySelector(dom) as HTMLElement
		chart.value = new VChart(getSpec(toValue(data)), {
			dom: domItem ?? dom
		})
		chart.value.renderSync()
		resize()
		// bitable.dashboard.setRendered()
	})
	tryOnUnMounted(() => {
		chart.value?.release()
	})
	return { chart, width, height }
}