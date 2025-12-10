import React from "react";
import { motion } from "framer-motion";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-600 focus:ring-primary",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
  success: "bg-success text-white hover:bg-success-600 focus:ring-success",
  danger: "bg-danger text-white hover:bg-danger-600 focus:ring-danger",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary"
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base"
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  
  const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </motion.button>
  );
}