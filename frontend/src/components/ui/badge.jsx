import * as React from "react"

function Badge({ className = "", variant = "default", children, ...props }) {
  const baseStyles = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-gray-900 text-white shadow hover:bg-gray-800",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
    outline: "text-gray-900 border-gray-300",
  }

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  )
}

export { Badge }