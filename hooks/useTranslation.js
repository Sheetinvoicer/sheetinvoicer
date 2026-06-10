'use client'

import { useEffect, useState } from 'react'

const translations = {
  en: {},
  es: {},
  fr: {},
  ar: {},
}

// Load translations
export function useTranslation() {
  const [locale, setLocale] = useState('en')
  const [t, setT] = useState(() => (key) => key)

  useEffect(() => {
    // Get locale from URL
    const pathParts = window.location.pathname.split('/')
    const lang = pathParts[1]
    if (['en', 'es', 'fr', 'ar'].includes(lang)) {
      setLocale(lang)
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = lang
    }
    
    // Load translations
    fetch(`/locales/${locale}/common.json`)
      .then(res => res.json())
      .then(data => {
        setT(() => (key) => {
          return key.split('.').reduce((obj, k) => obj?.[k], data) || key
        })
      })
      .catch(() => setT(() => (key) => key))
  }, [locale])

  return { t, locale }
}
