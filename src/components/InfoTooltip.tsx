import type { ReactNode } from 'react'
import cn from 'classnames'

interface InfoTooltipProps {
  content: ReactNode
  className?: string
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  return (
    <span
      tabIndex={0}
      className={cn(
        'group relative inline-flex h-4 w-4 cursor-help items-center justify-center outline-none',
        className,
      )}
    >
      <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
        i
      </span>
      <div className="pointer-events-none absolute left-1/2 top-full z-10 hidden -translate-x-1/2 translate-y-2 rounded-md bg-gray-900 p-3 text-xs text-white shadow-lg group-focus:block group-hover:block">
        <div className="w-max max-w-[90vw] text-left sm:min-w-[16rem] sm:max-w-md lg:max-w-lg">{content}</div>
      </div>
    </span>
  )
}
