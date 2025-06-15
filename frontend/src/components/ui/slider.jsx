import * as React from "react"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef(({ className, value, onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
  const handleChange = (e) => {
    const newValue = Number(e.target.value)
    onValueChange && onValueChange([newValue])
  }

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)} ref={ref} {...props}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value?.[0] || 0}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }