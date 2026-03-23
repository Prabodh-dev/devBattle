import { ReactNode } from 'react'

interface RightPanelProps {
  children?: ReactNode
}

export default function RightPanel({ children }: RightPanelProps) {
  return (
    <div className="h-full overflow-y-auto">
      {children}
    </div>
  )
}
