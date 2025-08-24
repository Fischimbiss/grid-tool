import * as React from 'react'
import { cn } from 'classnames'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={[
        'inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium',
        'bg-blue-600 hover:bg-blue-500 text-white',
        'disabled:opacity-60 disabled:pointer-events-none',
        className || ''
      ].join(' ')}
      {...props}
    />
  )
)
Button.displayName = 'Button'
