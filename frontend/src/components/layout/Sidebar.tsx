import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  TrophyIcon,
  CodeBracketIcon,
  UserCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const navigation = [
    { name: 'Chats', href: '/app/chats', icon: ChatBubbleLeftRightIcon },
    { name: 'Groups', href: '/app/groups', icon: UserGroupIcon },
    { name: 'Battles', href: '/app/battles', icon: TrophyIcon },
    { name: 'Contests', href: '/app/contests', icon: CodeBracketIcon },
    { name: 'Playground', href: '/app/playground', icon: CodeBracketIcon },
    { name: 'Friends', href: '/app/friends', icon: UserGroupIcon },
    { name: 'Leaderboard', href: '/app/leaderboard', icon: TrophyIcon },
  ]
  const isActive = (href: string) => router.pathname.startsWith(href)
  if (collapsed) {
    return (
      <div className="w-16 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="mb-8 p-2 rounded-lg hover:bg-gray-800 transition"
        >
          <ChevronDoubleRightIcon className="w-5 h-5" />
        </button>
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`mb-2 p-3 rounded-lg transition ${
              isActive(item.href)
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            title={item.name}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        ))}
        <div className="mt-auto space-y-2">
          <Link
            href="/app/notifications"
            className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition block"
            title="Notifications"
          >
            <BellIcon className="w-6 h-6" />
          </Link>
          <Link
            href="/app/profile"
            className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition block"
            title="Profile"
          >
            <UserCircleIcon className="w-6 h-6" />
          </Link>
          <Link
            href="/app/settings"
            className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition block"
            title="Settings"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col">
      {}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
              DB
            </div>
            <div>
              <h1 className="font-bold text-lg">DevBattle</h1>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <ChevronDoubleLeftIcon className="w-5 h-5" />
          </button>
        </div>
        {}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>
      {}
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive(item.href)
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      {}
      <div className="p-2 border-t border-gray-800 space-y-1">
        <Link
          href="/app/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
        >
          <BellIcon className="w-5 h-5" />
          <span className="font-medium">Notifications</span>
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
        </Link>
        <Link
          href="/app/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
        >
          <UserCircleIcon className="w-5 h-5" />
          <span className="font-medium">Profile</span>
        </Link>
        <Link
          href="/app/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
        >
          <Cog6ToothIcon className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  )
}
