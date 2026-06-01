import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
          <Toaster position="top-right" />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}