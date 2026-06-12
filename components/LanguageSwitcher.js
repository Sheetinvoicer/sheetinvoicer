'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Globe } from 'lucide-react'

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
    const saved = localStorage.getItem('language')
    if (saved) {
      const found = languages.find(l => l.code === saved)
      if (found) setCurrentLang(found)
    }
  }, [])

  const switchLanguage = (lang) => {
    setCurrentLang(lang)
    localStorage.setItem('language', lang.code)
    setIsOpen(false)
    // Show a toast or message before reload
    console.log(`Switched to ${lang.name}`)
    window.location.reload()
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 group"
      >
        <div className="flex items-center gap-2.5">
          <Globe size={18} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
          <span className="text-lg">{currentLang.flag}</span>
          <span className="text-sm font-medium">{currentLang.nativeName}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <>
          <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang)}
                  className={`w-full text-left px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors ${
                    currentLang.code === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lang.nativeName}</p>
                    <p className="text-xs text-gray-500">{lang.name}</p>
                  </div>
                  {currentLang.code === lang.code && (
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  )
}
