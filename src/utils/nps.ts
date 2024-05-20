import { NPSRole } from "@/types"

export const initRangeMap: Record<number, [number, number, number]> = {
	3: [1, 1, 1],
	4: [2, 1, 1],
	5: [3, 1, 1],
	6: [4, 1, 1],
	7: [4, 2, 1],
	8: [4, 2, 2],
	9: [5, 2, 2],
	10: [6, 2, 2],
	11: [7, 2, 2],
}

export function getInitRoleRange(num: number) {
	const numMap = initRangeMap[num]
	if (!numMap) return [1, 3]
	return [numMap[0], numMap[0] + numMap[1]]
}

export function getRole(value: number, range: [number, number], minScore: number) {
	if (!range) return NPSRole.Detractor
	const num = value + (minScore === 0 ? 1 : 0)
	if (num <= range[0]) return NPSRole.Detractor
	if (num <= range[1]) return NPSRole.Passive
	return NPSRole.Promoter
}