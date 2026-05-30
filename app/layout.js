import { Suspense } from 'react'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; font-family: system-ui; background: #f9fafb; }
          .dashboard-container { display: flex; min-height: 100vh; }
          .main-content { flex: 1; padding: 1.5rem; }
        ` }} />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}