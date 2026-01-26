import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  type = "button",
  icon,
  onClick,
  children,
  className = "",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium ${className}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
}
