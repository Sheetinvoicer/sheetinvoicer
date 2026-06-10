'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
]

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(languages[0])

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('app-language')
    if (savedLang) {
      const lang = languages.find(l => l.code === savedLang)
      if (lang) setCurrentLang(lang)
    }
  }, [])

  const switchLanguage = (lang) => {
    setCurrentLang(lang)
    localStorage.setItem('app-language', lang.code)
    setIsOpen(false)
    // Reload page to apply translations
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
      >
        <Globe size={18} />
        <span className="text-sm">{currentLang.flag} {currentLang.name}</span>
      </button>
      
      {isOpen && (
        <>
          <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  )
}
