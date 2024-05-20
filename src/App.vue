<script setup lang="ts">
import { computed, watch } from "vue"
import { useDark } from "@vueuse/core"
import { ThemeModeType, DashboardState } from "@lark-base-open/js-sdk"
import { useLanguage, useTheme, useState, useConfig } from "@/composables"
import { LocaleProvider, Button } from "@kousum/semi-ui-vue"
import configForm from "@/components/configForm/index.vue"
import npsChart from "@/components/npsChart/index.vue"
import zh_CN from "@kousum/semi-ui-vue/dist/locale/source/zh_CN"
import en_US from "@kousum/semi-ui-vue/dist/locale/source/en_US"
import ja_JP from "@kousum/semi-ui-vue/dist/locale/source/ja_JP"
import { useI18n } from "vue-i18n"
import { ref } from "vue"

const { t } = useI18n()
const lang = useLanguage()
const langMap: Record<string, any> = {
	"zh": zh_CN,
	"zh-TW": zh_CN,
	"zh-HK": zh_CN,
	"ja": ja_JP,
	"en": en_US,
}
const locale = computed(() => langMap?.[lang.value] ?? langMap["en"])

const isDark = useDark({
	selector: "body",
	attribute: "theme-mode",
})
const theme = useTheme()
watch(
	theme,
	() => {
		isDark.value = theme.value === ThemeModeType.DARK
	},
	{ immediate: true },
)

const state = useState()
const canConfigState = [DashboardState.Create, DashboardState.Config]
const canConfig = computed(() => canConfigState.includes(state.value))

const configRef = ref<InstanceType<typeof configForm>>()

const { config, save } = useConfig()
const chartConfig = computed(() => {
	if ([DashboardState.Create, DashboardState.Config].includes(state.value))
		return configRef.value?.config
	return config.value
})

const saveConfig = () => {
	if (chartConfig.value) save(chartConfig.value)
}
</script>

<template>
	<div
		style="height: 100%"
		lass="semi-light-scrollbar"
	>
		<LocaleProvider :locale="locale">
			<div class="dashboard-extension-container">
				<div
					class="dashboard-extension-preview"
					:style="{ width: canConfig ? 'calc(100% - 340px)' : '100%' }"
				>
					<npsChart :config="chartConfig" />
				</div>
				<div
					class="dashboard-extension-config"
					v-if="canConfig"
				>
					<div class="dashboard-extension-config-form">
						<configForm
							ref="configRef"
							:dataConfig="config"
						/>
					</div>
					<div class="dashboard-extension-config-bottom">
						<Button
							theme="solid"
							style="right: 5%; bottom: 5%; position: absolute"
							@click="saveConfig"
							>{{ t("button.confirm") }}</Button
						>
					</div>
				</div>
			</div>
		</LocaleProvider>
	</div>
</template>

<style>
body {
	color: var(--semi-color-text-0);
	background-color: transparent;
	background: transparent;
	background-image: transparent;
}
html,
body {
	height: 100%;
	margin: 0;
	padding: 0;
}
.dashboard-extension-container {
	display: flex;
	height: 100%;
	position: relative;
}
.dashboard-extension-preview {
	position: relative;
	width: calc(100% - 340px);
}
.dashboard-extension-config {
	border-left: 1px solid #5f5f5f;
	flex: 0 340px;
	height: 100%;
	padding-left: 5px;
	position: relative;
}

.dashboard-extension-config-form {
	height: calc(100% - 70px);
	padding-right: 5px;
	overflow-y: auto;
}
.dashboard-extension-config-bottom {
	height: 70px;
}
</style>
