'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
]

export default function LanguageSwitcher() {
  const [isClient, setIsClient] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(languages[0])

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('app-language')
    if (saved) {
      const found = languages.find(l => l.code === saved)
      if (found) setCurrentLang(found)
    }
  }, [])

  const switchLanguage = (lang) => {
    setCurrentLang(lang)
    localStorage.setItem('app-language', lang.code)
    setIsOpen(false)
    window.location.reload()
  }

  if (!isClient) {
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
          <span className="text-sm font-medium">{currentLang.nativeName}</span>
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
                currentLang.code === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.nativeName}</span>
              {currentLang.code === lang.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}