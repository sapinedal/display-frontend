import React, { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {/* <Sidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} /> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          {children}
        </main>

        {/* <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
          Hecho con el ❤️
        </footer> */}
      </div>
    </div>
  )
}