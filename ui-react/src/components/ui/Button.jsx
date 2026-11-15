import React from 'react'
import { twMerge } from 'tailwind-merge'

function Button({ className, children, ...props }) {
  return (
    <button className={twMerge('flex p-4 gap-4 text-th-grey items-center rounded-xl hover:bg-page cursor-pointer', className)} {...props}>
      {children}
    </button>
  )
}

export function TLButton({ className, children, ...props }) {
  return (
    <button {...props} className={twMerge('shrink-0 p-1 pl-0 cursor-pointer', className)}>
      {children}
    </button>
  )
}

export default Button