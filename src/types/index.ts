import type { IDataRange } from "@lark-base-open/js-sdk"

export const enum NPSRole {
	Promoter = 'promoter',
	Passive = 'passive',
	Detractor = 'detractor'
}

export interface RawConfig {
	dataSource: string
	dataRange?: string
	ratingField: string
	roleRange: [number, number]
	scoreRange: [number, number]
	showTable: boolean
}

export interface CustomConfig extends Record<string, any> {
	ratingField: string
	roleRange: [number, number]
	scoreRange: [number, number]
	showTable: boolean
}

export interface ExtensionConfig extends Record<string, any> {
	dataSource: string
	dataRange: IDataRange
	ratingField: string
	roleRange: [number, number]
	showTable: boolean
}