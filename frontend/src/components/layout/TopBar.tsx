import { Fragment, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { useAuthStore, useNotificationStore } from '@/lib/store'
import { userAPI } from '@/lib/api'
interface TopBarProps {
  onToggleRightPanel?: () => void
  title?: string
  subtitle?: string
}
export default function TopBar({ onToggleRightPanel, title, subtitle }: TopBarProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const [pendingFriends, setPendingFriends] = useState(0)
  const loadPending = useCallback(async () => {
    try {
      const response = await userAPI.getFriends()
      if (response.success) {
        setPendingFriends(response.data?.pending?.incoming?.length || 0)
      }
    } catch (error) {
      console.error('Failed to load friend badge', error)
    }
  }, [])
  useEffect(() => {
    loadPending()
    const handler = () => loadPending()
    window.addEventListener('friends:update', handler)
    return () => window.removeEventListener('friends:update', handler)
  }, [loadPending])
  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  return (
    <div className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {title ? (
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
              DB
            </div>
            <span className="font-bold text-lg">DevBattle</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-gray-800 transition">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => router.push('/app/friends')}
          className="p-2 rounded-lg hover:bg-gray-800 transition relative"
        >
          <UserGroupIcon className="w-5 h-5" />
          {pendingFriends > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 text-[10px] rounded-full flex items-center justify-center">
              {pendingFriends}
            </span>
          )}
        </button>
        <button
          onClick={() => router.push('/app/notifications')}
          className="p-2 rounded-lg hover:bg-gray-800 transition relative"
        >
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-[10px] rounded-full flex items-center justify-center">
              {Math.min(unreadCount, 9)}+
            </span>
          )}
        </button>
        {}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm font-semibold">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className={`text-xs font-medium ${
                    user?.tier === 'grandmaster' ? 'text-red-400' :
                    user?.tier === 'master' ? 'text-purple-400' :
                    user?.tier === 'expert' ? 'text-blue-400' :
                    user?.tier === 'coder' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {user?.tier || 'Beginner'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-xs text-gray-400">{user?.rating || 0} pts</span>
                </div>
              </div>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push('/app/profile')}
                    className={`${
                      active ? 'bg-gray-700' : ''
                    } flex items-center gap-2 w-full px-4 py-2 text-sm`}
                  >
                    <UserIcon className="w-4 h-4" />
                    View Profile
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-700' : ''
                    } flex items-center gap-2 w-full px-4 py-2 text-sm`}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Settings
                  </button>
                )}
              </Menu.Item>
              <div className="border-t border-gray-700 mt-1"></div>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`${
                      active ? 'bg-gray-700' : ''
                    } flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400`}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
        {onToggleRightPanel && (
          <button 
            onClick={onToggleRightPanel}
            className="p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
