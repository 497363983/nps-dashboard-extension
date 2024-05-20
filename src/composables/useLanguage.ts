import { bitable, type Language } from "@lark-base-open/js-sdk"
import { ref } from "vue"
import { tryOnMounted } from "../utils"

export function useLanguage() {
	const locale = ref<Language>("en")
	tryOnMounted(()=>{
		bitable.bridge.getLanguage().then((lang) => {
			locale.value = lang
		}).catch((e) => {
			console.error(e)
		})
	})
	return locale
}