import React from "react";

export default function Input({
  label,
  error,
  helperText,
  required = false,
  className = "",
  ...props
}) {
  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors
    focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-gray-300'}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <input
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}