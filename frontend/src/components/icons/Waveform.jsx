import React from 'react';

const Waveform = ({ className = "w-6 h-6", ...props }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v20" />
      <path d="M8 4v16" />
      <path d="M16 6v12" />
      <path d="M4 8v8" />
      <path d="M20 10v4" />
    </svg>
  );
};

export default Waveform;