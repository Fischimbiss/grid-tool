import * as React from 'react'
import { Button } from './button'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  toolbar?: boolean
}

export const RichTextarea = React.forwardRef<HTMLDivElement, Props>(
  ({ value, onChange, className, toolbar, ...props }, ref) => {
    const { placeholder, ...rest } = props
    const editorRef = React.useRef<HTMLDivElement>(null)

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      onChange?.(e.currentTarget.innerHTML)
    }

    const exec = (cmd: string) => {
      editorRef.current?.focus()
      document.execCommand(cmd)
      onChange?.(editorRef.current?.innerHTML || '')
    }

    const setRefs = (node: HTMLDivElement | null) => {
      editorRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    }

    return (
      <div className="w-full">
        {toolbar && (
          <div className="mb-2 flex flex-wrap gap-1 border-b pb-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onMouseDown={(e) => {
                e.preventDefault()
                exec('bold')
              }}
            >
              <b>B</b>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onMouseDown={(e) => {
                e.preventDefault()
                exec('italic')
              }}
            >
              <i>I</i>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onMouseDown={(e) => {
                e.preventDefault()
                exec('underline')
              }}
            >
              <u>U</u>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onMouseDown={(e) => {
                e.preventDefault()
                exec('insertUnorderedList')
              }}
            >
              &bull;
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onMouseDown={(e) => {
                e.preventDefault()
                exec('insertOrderedList')
              }}
            >
              1.
            </Button>
          </div>
        )}
        <div
          ref={setRefs}
          className={[
            'w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm',
            'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600',
            'min-h-[96px]',
            'whitespace-pre-wrap',
            'empty:before:content-[attr(data-placeholder)] before:text-neutral-400 before:pointer-events-none',
            'rich-text',
            className || '',
          ].join(' ')}
          contentEditable
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: value || '' }}
          data-placeholder={placeholder as any}
          {...rest}
        />
      </div>
    )
  }
)
RichTextarea.displayName = 'RichTextarea'

