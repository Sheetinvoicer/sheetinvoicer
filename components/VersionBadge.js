'use client'

import { useState, useEffect } from 'react'

export default function VersionBadge() {
  const [deployTime, setDeployTime] = useState('')

  useEffect(() => {
    setDeployTime(new Date().toLocaleTimeString())
  }, [])

  return (
    <div className="fixed bottom-2 left-2 z-50 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
      v2.0 • {deployTime}
    </div>
  )
}
