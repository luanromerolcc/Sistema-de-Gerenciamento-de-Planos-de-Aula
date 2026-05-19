import React from 'react'

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-colors duration-150 text-sm ${className}`}
      {...props}
    />
  )
})

Input.displayName = 'Input'
