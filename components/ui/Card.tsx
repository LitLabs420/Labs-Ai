import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: string;
  padding?: string;
  children: React.ReactNode;
}

export function Card({ children, className = "", variant, padding, ...props }: CardProps) {
  // variant and padding reserved for future customization options
  void variant;
  void padding;
  return (
    <div
      className={`rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm p-4 md:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}


