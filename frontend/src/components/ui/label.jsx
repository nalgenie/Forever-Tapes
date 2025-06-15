import * as React from "react"

const Label = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const baseStyles = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  const combinedClassName = `${baseStyles} ${className}`

  return (
    <label
      ref={ref}
      className={combinedClassName}
      {...props}
    >
      {children}
    </label>
  )
})
Label.displayName = "Label"

export { Label }