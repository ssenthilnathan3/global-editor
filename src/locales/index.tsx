import { useEffect, useMemo } from 'react'

import { proxy, useSnapshot } from 'valtio'

import en from './en'
import pt_BR from './pt-br'
import vi from './vi'
import zh_CN from './zh-cn'
import mitt from '@/utils/mitt'
import type { EventType } from '@/utils/mitt'
import { DEFAULT_LANG_VALUE } from '@/constants'

// Define supported language types
type LanguageType = 'en' | 'vi' | 'zh_CN' | 'pt_BR' | (string & {})

// Define message key types based on the 'en' locale
type MessageKeysType = keyof typeof en

// Interface for locale configuration
interface LocaleInterface {
  lang: LanguageType
  message: Record<LanguageType, Record<MessageKeysType, string>>
}

// Interface for Mitt events
interface MittEvents extends Record<EventType, unknown> {
  lang: LanguageType
}

// Default locale configuration
export const DEFAULT_LOCALE: LocaleInterface = {
  lang: DEFAULT_LANG_VALUE,
  message: {
    en,
    vi,
    zh_CN,
    pt_BR,
  },
}

class Locale {
  private emitter
  constructor() {
    this.emitter = mitt<MittEvents>()
  }

  // Getter and setter for current language
  get lang(): LanguageType {
    return DEFAULT_LOCALE.lang
  }

  set lang(lang: LanguageType) {
    if (!this.isLangSupported(lang)) {
      console.warn(
        `Can't find the current language "${lang}", Using language "${DEFAULT_LOCALE.lang}" by default`,
      )
      return
    }

    DEFAULT_LOCALE.lang = lang
    this.emitter.emit('lang', lang)
  }

  // Getter and setter for messages
  get message(): Record<LanguageType, Record<MessageKeysType, string>> {
    return DEFAULT_LOCALE.message
  }

  set message(message: Record<LanguageType, Record<MessageKeysType, string>>) {
    DEFAULT_LOCALE.message = message
  }

  // Load messages for a specific language
  loadLangMessage(lang: LanguageType): Record<MessageKeysType, string> {
    return this.message[lang]
  }

  // Check if a language is supported
  private isLangSupported(lang: LanguageType): boolean {
    const supportedLangs = Object.keys(this.message) as LanguageType[]
    return supportedLangs.includes(lang)
  }

  // Set the current language
  public setLang(lang: LanguageType) {
    this.lang = lang
  }

  // Register a language change watcher
  public registerWatchLang(hook: (lang: LanguageType) => void) {
    this.emitter.on('lang', hook)

    const unsubscribe = () => {
      this.emitter.off('lang', hook)
    }

    return {
      unsubscribe,
    }
  }

  // Set messages for a specific language
  public setMessage(lang: string, message: Record<MessageKeysType, string>) {
    this.message[lang] = message
  }

  // Build a translation function for a given language
  buildLocalesHandler(lang?: LanguageType) {
    if (!lang) {
      lang = this.lang
    }

    const message = this.loadLangMessage(lang)

    return function t(path: MessageKeysType) {
      return message[path] || path
    }
  }
}

const locale = new Locale()

// Proxy for reactive language state
const atomLang = proxy({
  lang: DEFAULT_LOCALE.lang,
})

function useLocale() {
  const atomLangSnap = useSnapshot(atomLang)

  const t = useMemo(() => {
    return locale.buildLocalesHandler(atomLangSnap.lang)
  }, [atomLangSnap.lang])

  useEffect(() => {
    const watchLang = locale.registerWatchLang((val) => {
      atomLang.lang = val
    })

    return () => {
      watchLang.unsubscribe()
    }
  }, [])

  return {
    lang: atomLangSnap.lang,
    t,
  }
}

const localeActions = {
  t: (path: MessageKeysType) => {
    return locale.buildLocalesHandler(atomLang.lang)(path)
  },
}

export default locale
export { Locale, localeActions, useLocale }

export { default as en } from './en'
export { default as pt_BR } from './pt-br'
export { default as vi } from './vi'
export { default as zh_CN } from './zh-cn'
