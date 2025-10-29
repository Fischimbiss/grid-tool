import { createPortal } from 'react-dom'
import type { KeyboardEvent, ReactNode } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import cn from 'classnames'

interface InfoTooltipProps {
  content: ReactNode
  className?: string
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const portalTarget = typeof document !== 'undefined' ? document.body : null

  useLayoutEffect(() => {
    if (!isOpen) return

    let animationFrame = 0

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const gap = 8
      const margin = 12
      let top = triggerRect.bottom + gap
      let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < margin) {
        left = margin
      } else if (left + tooltipRect.width > viewportWidth - margin) {
        left = viewportWidth - margin - tooltipRect.width
      }

      if (top + tooltipRect.height > viewportHeight - margin) {
        top = triggerRect.top - gap - tooltipRect.height
      }

      if (top < margin) {
        top = Math.max(margin, triggerRect.bottom + gap)
      }

      setPosition({ top, left })
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(updatePosition)
    }

    updatePosition()

    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('scroll', scheduleUpdate, true)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate, true)
    }
  }, [isOpen, content])

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape') {
      handleClose()
    }
  }

  const tooltip =
    portalTarget && isOpen ? (
      createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          className="pointer-events-none fixed z-[9999] rounded-md bg-gray-900 p-3 text-xs text-white shadow-lg"
          style={{ top: position.top, left: position.left }}
        >
          <div className="w-max max-w-[90vw] text-left sm:min-w-[16rem] sm:max-w-md lg:max-w-lg">{content}</div>
        </div>,
        portalTarget,
      )
    ) : null

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        onFocus={handleOpen}
        onBlur={handleClose}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex h-4 w-4 cursor-help items-center justify-center outline-none',
          className,
        )}
      >
        <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
          i
        </span>
      </span>
      {tooltip}
    </>
  )
}
