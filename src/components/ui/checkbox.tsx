import * as React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export const Checkbox = React.forwardRef<HTMLInputElement, Props>(({ className, ...p }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={['h-4 w-4 rounded border-neutral-500 bg-neutral-100', className || ''].join(' ')}
    {...p}
  />
))
Checkbox.displayName = 'Checkbox'
