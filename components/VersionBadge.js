'use client'
import { useEffect, useState } from 'react'

export default function VersionBadge() {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    setVisible(true)
  }, [])
  
  if (!visible) return null
  
  return (
    <div className="fixed bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-50 opacity-75">
      v2.0 - LanguageSwitcher Added
    </div>
  )
}
