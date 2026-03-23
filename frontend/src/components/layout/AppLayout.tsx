import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import RightPanel from './RightPanel'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuthStore } from '@/lib/store'
import socketService from '@/lib/socket'

interface AppLayoutProps {
  children: ReactNode
  showRightPanel?: boolean
  rightPanelContent?: ReactNode
}

export default function AppLayout({ children, showRightPanel = false, rightPanelContent }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(showRightPanel)
  const { token, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    setRightPanelOpen(showRightPanel)
  }, [showRightPanel])

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token)
    }

    return () => {
      // Cleanup socket on unmount
      if (!isAuthenticated) {
        socketService.disconnect()
      }
    }
  }, [isAuthenticated, token])

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <TopBar onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)} />

          {/* Center Panel */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>

        {/* Right Panel */}
        {rightPanelOpen && (
          <div className="w-80 border-l border-gray-800 bg-gray-900 overflow-y-auto">
            {rightPanelContent || <div className="p-4 text-gray-500">No content</div>}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
