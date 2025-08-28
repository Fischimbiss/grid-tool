import * as React from 'react'

type Props = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, Props>(({ className, children, ...p }, ref) => (
  <select
    ref={ref}
    className={[
      'w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-blue-600',
      className || ''
    ].join(' ')}
    {...p}
  >
    {children}
  </select>
))
Select.displayName = 'Select'
