<script lang="ts" setup>
import detractorsIcon from "@/components/icons/detractorsIcon.vue"
import passivesIcon from "@/components/icons/passivesIcon.vue"
import promotersIcon from "@/components/icons/promotersIcon.vue"
import { NPSRole } from "@/types"
import { Tooltip } from "@kousum/semi-ui-vue"

defineProps<{
	role: NPSRole
	tooltip: string
}>()

const roleIconMap = {
	[NPSRole.Promoter]: promotersIcon,
	[NPSRole.Passive]: passivesIcon,
	[NPSRole.Detractor]: detractorsIcon,
}
</script>

<template>
	<Tooltip :content="tooltip">
		<component :is="roleIconMap[role]" />
	</Tooltip>
</template>
