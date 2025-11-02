import React from "react";
import { cn } from "../../../lib/utils";

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  icon = null,
  fullWidth = false,
  loading = false,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    // primary color: #02A0AA (kept centralized here to reduce color noise)
    primary: "bg-[#02A0AA] hover:bg-[#018f95] text-white focus:ring-[#02A0AA]",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
    success: "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    warning: "bg-[#ff8a65] hover:bg-[#ff744a] text-white focus:ring-[#ff8a65]",
    outline:
      "border-2 border-[#02A0AA] text-[#02A0AA] hover:bg-[#f0fdfd] focus:ring-[#02A0AA]",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
