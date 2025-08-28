import * as React from 'react'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export const RichTextarea = React.forwardRef<HTMLDivElement, Props>(
  ({ value, onChange, className, ...props }, ref) => {
    const { placeholder, ...rest } = props
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      onChange?.(e.currentTarget.innerHTML)
    }
    return (
      <div
        ref={ref}
        className={[
          'w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm',
          'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600',
          'min-h-[96px]',
          'whitespace-pre-wrap',
          'empty:before:content-[attr(data-placeholder)] before:text-neutral-400 before:pointer-events-none',
          className || '',
        ].join(' ')}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        data-placeholder={placeholder as any}
        {...rest}
      />
    )
  }
)
RichTextarea.displayName = 'RichTextarea'
