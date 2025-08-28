import React, { useState } from 'react'
import { Card } from './card'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export const CollapsibleCard: React.FC<Props> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card className="space-y-2">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold">{title}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </Card>
  )
}

export default CollapsibleCard
