'use client'

import { useState, useEffect } from 'react'

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
    const saved = localStorage.getItem('language')
    if (saved) {
      const found = languages.find(l => l.code === saved)
      if (found) setCurrentLang(found)
    }
  }, [])

  const switchLanguage = (lang) => {
    setCurrentLang(lang)
    localStorage.setItem('language', lang.code)
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span>{currentLang.name}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang)}
              className="w-full px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
