'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { getAvailableLanguages, setLanguage, getCurrentLanguage, t } from '/i18n.js';

export default function LanguageSwitcher() {
  const [isClient, setIsClient] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(null)
  const languages = getAvailableLanguages()

  useEffect(() => {
    setIsClient(true)
    const savedLangCode = getCurrentLanguage()
    const found = languages.find(l => l.code === savedLangCode)
    setCurrentLang(found || languages[0])
  }, [])

  const switchLanguage = (lang) => {
    setCurrentLang(lang)
    setLanguage(lang.code)
    setIsOpen(false)
  }

  if (!isClient || !currentLang) {
    return null
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentLang.flag}</span>
          <span className="text-sm font-medium">{currentLang.name}</span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors ${
                currentLang.code === lang.code ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
              {currentLang.code === lang.code && (
                <span className="ml-auto text-purple-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}