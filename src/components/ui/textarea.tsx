import * as React from 'react'
type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(({ className, ...p }, ref) => (
  <textarea
    ref={ref}
    className={[
      'w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm',
      'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600',
      'min-h-[96px]',
      className || ''
    ].join(' ')}
    {...p}
  />
))
Textarea.displayName = 'Textarea'
