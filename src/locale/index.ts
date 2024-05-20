import { zh } from "./zh"
import { en } from "./en"
import { ja } from "./ja"
import { createI18n } from "vue-i18n"
import { bitable } from "@lark-base-open/js-sdk"

export const i18n = createI18n({
	locale: "en",
	legacy: false,
	messages: {
		zh,
		en,
		ja,
	}
})

const localeMap: Record<string, "en" | "zh" | "ja"> = {
	"zh": "zh",
	"zh-TW": "zh",
	"zh-HK": "zh",
	"en": "en",
	"ja": "ja",
}

bitable.bridge.getLanguage().then((lang) => {
	i18n.global.locale.value = localeMap[lang] || "en"
  })
  