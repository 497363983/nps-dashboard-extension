<script lang="ts" setup>
import { useTableMetaList, useDataRange, useState } from "@/composables"
import {
	FieldType,
	SourceType,
	DashboardState,
	IDataCondition,
	IConfig,
} from "@lark-base-open/js-sdk"
import {
	Form,
	FormSelect,
	FormSelectOption,
	Tooltip,
	type FormApi,
	Checkbox,
} from "@kousum/semi-ui-vue"
import { IconIssueStroked } from "@kousum/semi-icons-vue"
import {
	ref,
	watch,
	type Ref,
	h,
	computed,
	nextTick,
	watchEffect,
	reactive,
} from "vue"
import { useI18n } from "vue-i18n"
import { debouncedRef } from "@vueuse/core"
import { RawConfig, CustomConfig } from "@/types"
import tableIcon from "@/components/icons/tableIcon.vue"
import ratingFieldIcon from "@/components/icons/ratingFieldIcon.vue"
import rangeSlider from "@/components/rangeSlider/index.vue"
import viewIcon from "@/components/viewIcon/index.vue"

interface FormState<T extends Record<string, any> = Record<string, any>> {
	values?: T
	errors?:
		| Record<string, any>
		| {
				[x: string]: string
		  }
	touched?:
		| Record<string, any>
		| {
				[x: string]: boolean
		  }
}

const props = defineProps<{
	dataConfig?: IConfig
}>()

const state = useState()
const rawConfig = computed(() => {
	if (!props.dataConfig) return
	const condition = props.dataConfig?.dataConditions[0]
	const customConfig = props.dataConfig.customConfig as CustomConfig | undefined
	return {
		dataSource: condition.tableId,
		dataRange:
			condition?.dataRange?.type === SourceType.ALL
				? SourceType.ALL
				: condition?.dataRange?.viewId,
		ratingField: customConfig?.ratingField,
		roleRange: customConfig?.roleRange,
		showTable: customConfig?.showTable,
	}
})
const formAPI = ref<FormApi>()
const getFormAPI = (api: FormApi) => {
	formAPI.value = api
}
const formValues = reactive<RawConfig>({
	dataSource: "",
	dataRange: SourceType.ALL,
	ratingField: "",
	roleRange: [1, 3],
	showTable: true,
	scoreRange: [1, 3],
})
const { t } = useI18n()
const formRef = ref<InstanceType<typeof Form>>()

const forceRefresh = (refreshKey: Ref<string>) => {
	return () => {
		refreshKey.value = `${refreshKey.value.slice(0, refreshKey.value.length - 1)}${parseInt(refreshKey.value.slice(-1)) + 1}`
		nextTick(() => {
			formAPI.value?.validate()
		})
	}
}

const tableMetaList = useTableMetaList(FieldType.Rating)
const dataSourceRefreshKey = ref("dataSourceRefreshKey0")
const initDataSource = computed(() => {
	if (state.value === DashboardState.Config && rawConfig.value?.dataSource)
		return rawConfig.value.dataSource
	const firstHasRating = tableMetaList.value.find((i) => {
		if (i.fieldMetaList.length > 0) return true
		return false
	})
	if (!firstHasRating) return tableMetaList.value?.[0]?.id
	return firstHasRating.id
})
watch(tableMetaList, () => {
	forceRefresh(dataSourceRefreshKey)()
})
const chosenTableId = ref<string>()
const onDataSourceChange = (value: string) => {
	if (value === chosenTableId.value) return
	chosenTableId.value = value
	formValues.dataSource = value
}
const chosenTableMeta = computed(() => {
	return tableMetaList.value.find((item) => item.id === chosenTableId.value)
})

const dataRangeRefreshKey = ref("dataRangeRefreshKey0")
const initDataRange = computed(() => {
	if (
		state.value === DashboardState.Config &&
		rawConfig.value?.dataRange &&
		chosenTableId.value === rawConfig.value.dataSource
	)
		return rawConfig.value.dataRange
	return SourceType.ALL
})
const tableDataRangeList = useDataRange(chosenTableId)
const tableDataRangeOptions = computed(() => {
	return tableDataRangeList.value.map((item) => {
		if (item.type === SourceType.ALL) {
			return {
				value: SourceType.ALL,
				label: t("form.allData"),
				icon: tableIcon,
			}
		}
		return {
			value: item.viewId,
			label: item.viewName,
			// @ts-ignore
			type: item.viewType,
		}
	})
})
watch(tableDataRangeList, () => {
	forceRefresh(dataRangeRefreshKey)()
})
const onDataRangeChange = (value: string) => {
	if (value === formValues.dataRange) return
	formValues.dataRange = value
}

type RatingField = {
	id: string
	name: string
	ratingRange: [number, number]
}

const ratingFieldRefreshKey = ref("ratingFieldRefreshKey0")
const ratingFieldValue = ref<string>()
const ratingFieldList = computed(() => {
	if (!chosenTableMeta.value) return []
	return chosenTableMeta.value.fieldMetaList
		.map((item) => {
			if (item.type !== FieldType.Rating) return
			return {
				id: item.id,
				name: item.name,
				// @ts-ignore
				ratingRange: [item.property.min, item.property.max],
			}
		})
		.filter(Boolean) as Array<RatingField>
})
const initRatingField = computed(() => {
	if (
		state.value === DashboardState.Config &&
		rawConfig.value?.ratingField &&
		ratingFieldList.value.find(
			(item) => item.id === rawConfig.value?.ratingField,
		)
	)
		return rawConfig.value.ratingField
	return ratingFieldList.value[0]?.id
})
watch(ratingFieldList, () => {
	forceRefresh(ratingFieldRefreshKey)()
})
const onRatingFieldChange = (value: string) => {
	if (value === ratingFieldValue.value) return
	ratingFieldValue.value = value
	formValues.ratingField = value
}
const ratingFieldValidateRules = [
	{
		// @ts-ignore
		validator(rule, value: string) {
			const field = ratingFieldList.value.find((item) => item.id === value)
			if (!field) return new Error(t("form.ratingFieldNeedToBeSelected"))
			const [min, max] = field.ratingRange
			const ratingNum = max - min + 1
			if (ratingNum < 3) return new Error(t("form.needsAtLeastThreeRatings"))
		},
	},
]

const chosenRatingField = computed(() => {
	return ratingFieldList.value.find(
		(item) => item.id === ratingFieldValue.value,
	)
})

const roleRangeRefreshKey = ref("roleRangeRefreshKey0")
const initRoleRange = computed(() => {
	if (state.value === DashboardState.Config && rawConfig.value?.roleRange)
		return rawConfig.value.roleRange
	return
})
watch(chosenRatingField, () => {
	forceRefresh(roleRangeRefreshKey)()
})
const onRoleRangeChange = (value: [number, number]) => {
	formValues.roleRange = value
}

const showTableRefreshKey = ref("showTableRefreshKey0")
const showTable = ref(true)
const initShowTable = computed(() => {
	if (
		state.value === DashboardState.Config &&
		rawConfig.value?.showTable !== undefined
	)
		return rawConfig.value.showTable
	return showTable.value
})
const onShowTableChange = (e: Event) => {
	// @ts-ignore
	showTable.value = e.target.checked
	// @ts-ignore
	formValues.showTable = e.target.checked
}
// watch(
// 	() => showTable.value,
// 	() => {
// 		console.log("force update showTable")
// 		forceRefresh(showTableRefreshKey)()
// 	},
// )

const config = ref<IConfig>()
const debouncedRefConfig = debouncedRef(config, 100)

watchEffect(() => {
	const rangeId = formValues.dataRange
	const dataRange =
		rangeId === SourceType.ALL
			? tableDataRangeList.value.find((i) => i.type === SourceType.ALL)
			: tableDataRangeList.value.find(
					// @ts-ignore
					(i) => i.viewId === formValues.dataRange,
				)
	const condition: IDataCondition = {
		tableId: formValues.dataSource ?? "",
		dataRange,
		groups: [
			{
				fieldId: formValues.ratingField ?? "",
			},
		],
		series: "COUNTA",
	}
	const customConfig: CustomConfig = {
		ratingField: formValues.ratingField ?? "",
		roleRange: formValues.roleRange ?? [1, 3],
		showTable: showTable.value,
		scoreRange: chosenRatingField.value?.ratingRange,
	}
	config.value = {
		dataConditions: [condition],
		customConfig,
	}
})

const onFormStateChange = (formState: FormState<RawConfig>) => {
	const values = formState.values

	if (values?.dataSource) {
		onDataSourceChange(values.dataSource)
	}
	if (values?.dataRange) {
		onDataRangeChange(values.dataRange)
	}
	if (values?.roleRange?.length) {
		onRoleRangeChange(values.roleRange)
	}
	if (values?.ratingField) {
		onRatingFieldChange(values.ratingField)
	}
}

defineExpose({
	config: debouncedRefConfig,
})
</script>

<template>
	<Form
		ref="formRef"
		@change="onFormStateChange"
		:getFormApi="getFormAPI"
		:allowEmpty="true"
	>
		<FormSelect
			:initValue="initDataSource"
			field="dataSource"
			style="width: 100%"
			filter
			:label="t('form.dataSource')"
			:key="dataSourceRefreshKey"
		>
			<template v-for="item in tableMetaList">
				<FormSelectOption :value="item.id">
					<tableIcon />
					<span>{{ item.name }}</span>
				</FormSelectOption>
			</template>
		</FormSelect>
		<FormSelect
			:initValue="initDataRange"
			field="dataRange"
			filter
			style="width: 100%"
			:label="{
				text: t('form.dataRange'),
				extra: h(
					Tooltip,
					{ content: h('span', null, t('form.dataRangeExtra')) },
					{
						default: () =>
							h(IconIssueStroked, {
								style: {
									color: 'var(--semi-color-text-0)',
								},
							}),
					},
				),
			}"
			:key="dataRangeRefreshKey"
		>
			<template v-for="item in tableDataRangeOptions">
				<FormSelectOption :value="item.value">
					<viewIcon
						v-if="item.value !== SourceType.ALL"
						:viewType="item.type"
					/>
					<tableIcon v-else />
					{{ item.label }}
				</FormSelectOption>
			</template>
		</FormSelect>
		<FormSelect
			:initValue="initRatingField"
			style="width: 100%"
			field="ratingField"
			filter
			:label="t('form.ratingField')"
			:key="ratingFieldRefreshKey"
			:rules="ratingFieldValidateRules"
			:placeholder="t('form.pleaseSelectRatingField')"
		>
			<template v-for="item in ratingFieldList">
				<FormSelectOption :value="item.id">
					<ratingFieldIcon />
					{{ item.name }}
				</FormSelectOption>
			</template>
		</FormSelect>
		<rangeSlider
			:key="roleRangeRefreshKey"
			v-if="chosenRatingField"
			field="roleRange"
			:min="chosenRatingField.ratingRange[0]"
			:max="chosenRatingField.ratingRange[1]"
			:initValue="initRoleRange"
		></rangeSlider>
		<Checkbox
			:key="showTableRefreshKey"
			:value="showTable"
			:defaultChecked="initShowTable"
			@change="onShowTableChange"
		>
			{{ t("form.showTable") }}
		</Checkbox>
	</Form>
</template>
