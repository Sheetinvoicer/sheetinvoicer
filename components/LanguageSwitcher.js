'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (locale) => {
    // Get the current path without locale
    const pathParts = pathname.split('/')
    const currentLocale = pathParts[1]
    
    // If current locale is one of our locales, replace it
    if (languages.some(l => l.code === currentLocale)) {
      pathParts[1] = locale
      const newPath = pathParts.join('/')
      router.push(newPath || '/')
    } else {
      // Add locale to path
      router.push(`/${locale}${pathname}`)
    }
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Globe size={18} />
        <span className="text-sm">Language</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
