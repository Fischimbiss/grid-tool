import * as React from 'react'
type Props = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, Props>(({ className, ...p }, ref) => (
  <input
    ref={ref}
    className={[
      'w-full rounded-md border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm',
      'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600',
      className || ''
    ].join(' ')}
    {...p}
  />
))
Input.displayName = 'Input'
