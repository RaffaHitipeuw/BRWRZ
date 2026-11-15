import React from 'react'
import { twMerge } from 'tailwind-merge'

function Popup({ className, children, ...props }) {
  return (
    <div className={twMerge('rounded-2xl bg-white gap-2 absolute shadow-subtle-m max-h-full overflow-y-auto scrollbar-none', className)} {...props}>
      {children}
    </div>
  )
}

export default Popup