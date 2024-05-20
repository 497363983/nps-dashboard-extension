<script lang="ts" setup>
import calendarViewIcon from "@/components/icons/calendarViewIcon.vue"
import gridViewIcon from "@/components/icons/gridViewIcon.vue"
import galleryViewIcon from "@/components/icons/galleryViewIcon.vue"
import ganttViewIcon from "@/components/icons/ganttViewIcon.vue"
import kanbanViewIcon from "@/components/icons/kanbanViewIcon.vue"
import formViewIcon from "@/components/icons/formViewIcon.vue"
import { ViewType } from "@lark-base-open/js-sdk"

const iconMap: Record<number, any> = {
	[ViewType.Calendar]: calendarViewIcon,
	[ViewType.Grid]: gridViewIcon,
	[ViewType.Gallery]: galleryViewIcon,
	[ViewType.Gantt]: ganttViewIcon,
	[ViewType.Kanban]: kanbanViewIcon,
	[ViewType.Form]: formViewIcon,
}

defineProps<{
	viewType: number
}>()

</script>


<template>
	<component :is="iconMap[viewType]" />
</template>