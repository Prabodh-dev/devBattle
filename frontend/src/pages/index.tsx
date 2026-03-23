import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/lib/store'

const highlights = [
  {
    icon: '💬',
    title: 'Real-Time Messaging',
    description: 'Threaded chats, code snippets, reactions and presence in one view.'
  },
  {
    icon: '⚔️',
    title: 'Code Battles',
    description: 'Duels with live timers, ELO scoring and instant replays.'
  },
  {
    icon: '🏟️',
    title: 'Arena Contests',
    description: 'Team-based tournaments with rolling leaderboards and commentary.'
  }
]

const metrics = [
  { label: 'Developers waiting', value: '2,350+' },
  { label: 'Problems available', value: '180+' },
  { label: 'Avg. decision time', value: '180 sec' },
  { label: 'Supported languages', value: '5' }
]

const featureGrid = [
  {
    title: 'Tactical Messaging',
    points: ['Multi-room routing', 'Code + voice notes', 'Inline Monaco previews'],
    theme: 'from-cyan-500/10 via-blue-500/5 to-transparent'
  },
  {
    title: 'Judge Orchestration',
    points: ['Docker sandboxes', 'Resource caps', 'Replayable verdicts'],
    theme: 'from-amber-500/10 via-orange-400/10 to-transparent'
  },
  {
    title: 'Battle Desk',
    points: ['ELO tracker', 'Live diff viewer', 'Spectator controls'],
    theme: 'from-violet-500/10 via-indigo-500/5 to-transparent'
  },
  {
    title: 'Arena Ops',
    points: ['Contest macros', 'Team chat lanes', 'Auto leaderboards'],
    theme: 'from-emerald-500/10 via-lime-400/10 to-transparent'
  }
]

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      if (isAuthenticated) {
        router.replace('/app/chats')
      }
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  const heroStats = [
    { label: 'Latency', value: '45ms', detail: 'co-located edge mesh' },
    { label: 'Sandbox boots', value: '118/sec', detail: 'Docker + Firecracker' }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Head>
        <title>DevBattle | Operate Like A Proving Ground</title>
      </Head>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(56,189,248,.15), transparent 45%)' }} />

        <header className="relative z-10 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-slate-900">
                DB
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">DevBattle</p>
                <p className="font-semibold">Live Developer Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/problems" className="text-sm font-medium text-slate-300 hover:text-white transition">
                Explore Problems
              </Link>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
                Log In
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 text-slate-900 font-semibold">
                Launch Console
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <section className="max-w-6xl mx-auto px-6 py-24 grid gap-12 lg:grid-cols-[3fr,2fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Signals Enabled
              </div>
              <h1 className="mt-6 text-5xl sm:text-6xl font-black leading-tight">
                Operate your <span className="text-cyan-400">developer arena</span> with tactical clarity.
              </h1>
              <p className="mt-6 text-lg text-slate-300 max-w-2xl">
                DevBattle unifies high-velocity messaging, adversarial coding and automated judging inside one cohesive ops layer. Every interaction is tracked, replayable and contest-ready.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/register" className="btn-glow">
                  Schedule A Battle
                </Link>
                <Link href="/docs" className="btn-ghost">
                  Review Protocols
                </Link>
              </div>
              <dl className="mt-12 flex flex-wrap gap-10">
                {heroStats.map(stat => (
                  <div key={stat.label}>
                    <dt className="text-sm uppercase tracking-[0.4em] text-slate-500">{stat.label}</dt>
                    <dd className="text-3xl font-semibold text-white">{stat.value}</dd>
                    <p className="text-xs text-slate-400 mt-1">{stat.detail}</p>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-cyan-500/30 via-indigo-500/20 to-transparent" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-2xl">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Match Control</span>
                  <span>Session 07 · Active</span>
                </div>
                <div className="mt-6 grid gap-4 text-sm">
                  {highlights.map(item => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-slate-300 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Live Metrics</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {metrics.map(metric => (
                      <div key={metric.label}>
                        <p className="text-2xl font-bold text-white">{metric.value}</p>
                        <p className="text-xs text-slate-400">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-white/5 bg-slate-950/60">
            <div className="max-w-6xl mx-auto px-6 py-20">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-slate-500">System Spine</p>
                  <h2 className="mt-3 text-4xl font-bold">Orchestrated tooling across every battle lane.</h2>
                </div>
                <Link href="/stack" className="btn-ghost">
                  View Diagram →
                </Link>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {featureGrid.map(block => (
                  <div key={block.title} className={`rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-lg relative overflow-hidden`}> 
                    <div className={`absolute inset-0 bg-gradient-to-br ${block.theme}`} />
                    <div className="relative">
                      <h3 className="text-2xl font-semibold text-white">{block.title}</h3>
                      <ul className="mt-6 space-y-2 text-sm text-slate-200">
                        {block.points.map(point => (
                          <li key={point} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-black/30 border-t border-white/5">
            <div className="max-w-6xl mx-auto px-6 py-16 grid gap-10 lg:grid-cols-[1.2fr,1fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Command Briefing</p>
                <h2 className="mt-4 text-4xl font-bold">Stay ahead of the signal.</h2>
                <p className="mt-4 text-slate-300 max-w-xl">
                  Every contest publishes real-time telemetry into activity feeds, notifications, and friend networks. Build rivalries, scout opponents, and launch scrims with a single invite.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/battles" className="btn-glow">
                    Monitor Live Battles
                  </Link>
                  <Link href="/friends" className="btn-ghost">
                    Sync Squad
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Pipeline Preview</p>
                <div className="mt-6 space-y-4 text-sm text-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Auth + friends</span>
                    <span className="text-emerald-400">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Realtime socket mesh</span>
                    <span className="text-emerald-400">Stable</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Judge pipeline</span>
                    <span className="text-yellow-300">45ms avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notifications</span>
                    <span className="text-slate-300">Queued</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="relative z-10 border-t border-white/10 bg-slate-950">
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">DevBattle Stack</p>
              <p className="text-slate-300 mt-2">Next.js · Socket.io · Docker sandboxes · Redis presence</p>
            </div>
            <Link href="/register" className="btn-glow">
              Deploy Your Arena
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
