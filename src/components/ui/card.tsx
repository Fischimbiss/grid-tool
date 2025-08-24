import * as React from 'react'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['panel', 'p-4 sm:p-5', className || ''].join(' ')} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />
}
