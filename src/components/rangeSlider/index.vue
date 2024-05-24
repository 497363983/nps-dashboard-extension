<script lang="ts" setup>
import { FormSlider, useFieldApi, useFormState } from "@kousum/semi-ui-vue"
import roleItem from "./role.vue"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { getInitRoleRange, getRole } from "@/utils"

const props = defineProps<{
	field: string
	label?: string
	min: number
	max: number
	initValue?: [number, number]
}>()

const { t } = useI18n()
const fieldApi = useFieldApi(props.field)
const refreshKey = ref(0)
const formState = useFormState()

const forceRefresh = () => {
	refreshKey.value++
}

const roleValues = computed(() => {
	return Array.from(Array(props.max - props.min + 1).keys()).map(
		(x) => x + props.min,
	)
})

const marks = computed(() => {
	const m: Record<number, string> = {}
	Array.from(Array(props.max - props.min).keys()).forEach((x) => {
		m[x + 1] = String(x + 1)
	})
	return m
})

const initRange = computed(() => {
	if (props.initValue) return props.initValue
	const num = roleValues.value.length
	return getInitRoleRange(num)
})

watch(
	() => initRange.value,
	() => {
		fieldApi.setValue(initRange.value)
		forceRefresh()
	},
	{ immediate: true },
)

const rolesList = computed(() => {
	return roleValues.value.map((x) => {
		return {
			value: x,
			role: getRole(x, formState.value.values[props.field], props.min),
		}
	})
})

const sliderPadding = computed(() => {
	return 100 / roleValues.value.length / 2 + "%"
})

const onMouseUp = (e: MouseEvent) => {
	const value = fieldApi.getValue()
	if (value[0] >= value[1]) {
		e.preventDefault()
		fieldApi.setValue([value[1] - 1, value[1]])
		forceRefresh()
	}
}
</script>

<template>
	<div style="margin-top: 10px">
		<FormSlider
			:key="refreshKey"
			:field="field"
			:initValue="initRange"
			:noLabel="true"
			:min="1"
			:max="max - min"
			:marks="marks"
			:railStyle="{
				cursor: 'default',
				background: 'transparent',
			}"
			:tipFormatter="null"
			:showMarkLabel="false"
			@MouseUp="onMouseUp"
			range
		/>
		<div style="position: relative">
			<div class="slider-role-container">
				<template v-for="i in rolesList">
					<div class="slider-role-item">
						<roleItem
							:role="i.role"
							:tooltip="t(`npsRole.${i.role}`)"
						/>
						<span style="user-select: none; z-index: -1">
							{{ i.value }}
						</span>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<style>
.semi-slider {
	padding: 0 calc(19px + v-bind(sliderPadding));
}
.semi-slider-handle {
	border-radius: 10px;
	width: 9px;
	height: 18px;
	margin-top: 8px;
}
.semi-slider-track {
	background: transparent;
	cursor: default;
}
.slider-role-container {
	display: flex;
	justify-content: space-between;
	transform: translateY(-130%);
	position: absolute;
	left: 0px;
	right: 0px;
	border-radius: 4px;
	background-color: #dee0e3;
}
body[theme-mode="dark"] .slider-role-container {
	background-color: var(--semi-color-bg-4);
}

.slider-values-container {
	position: relative;
}
.slider-values-item {
	display: inline-block;
}
.slider-role-container {
	padding: 5px 10px;
}
.slider-role-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.slider-role-item span {
	margin-top: 4px;
	text-align: center;
	font-weight: 400;
	font-size: 12px;
}

.semi-slider-dot {
	z-index: 100;
}
</style>
