import * as React from 'react'
import cn from 'classnames'

type Variant = 'primary' | 'secondary' | 'danger' | 'neutral' | 'ghost'
type Size = 'default' | 'sm' | 'icon'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-500',
  secondary:
    'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500',
  danger:
    'bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-500',
  neutral:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-500',
  ghost:
    'bg-transparent text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500',
}

const sizeClasses: Record<Size, string> = {
  default: 'px-3.5 py-2 text-sm',
  sm: 'px-2.5 py-1.5 text-xs',
  icon: 'h-8 w-8 justify-center p-0',
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    { className, variant = 'primary', size = 'default', ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
 codex/optimize-usability-and-accessibility-wrp6sy
        'inline-flex items-center gap-2 rounded-md font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-60 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],

        'inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium',
        'bg-pink-600 hover:bg-pink-500 text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-500',
        'disabled:opacity-60 disabled:pointer-events-none',
 main
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
