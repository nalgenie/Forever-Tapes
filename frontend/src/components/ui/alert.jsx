import * as React from "react"

const Alert = React.forwardRef(({ className = "", variant = "default", children, ...props }, ref) => {
  const baseStyles = "relative w-full rounded-lg border px-4 py-3 text-sm"
  
  const variants = {
    default: "bg-white text-gray-900 border-gray-200",
    destructive: "border-red-200 text-red-900 bg-red-50",
  }

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`

  return (
    <div
      ref={ref}
      role="alert"
      className={combinedClassName}
      {...props}
    >
      {children}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h5>
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </div>
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }