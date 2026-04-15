"use client";

import React, { useState, useEffect } from "react";
import { formatRegistrationDate } from "@/lib/utils/dateFormatter";

interface Props {
  label?: string;
  register: any;
  name: string;
  type?: string;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  rules?: any;
}

const DarkInput = ({
  label,
  register,
  name,
  type = "text",
  error,
  placeholder,
  icon,
  onChange,
  value,
  rules,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value ? String(value).length > 0 : false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setHasValue(String(value).length > 0);
    }
  }, [value]);

  const isPasswordField = type === "password";
  const isDateType = type === "date";
  
  const resolvedType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    // Call the register's onChange if it exists
    if (register && register(name) && register(name).onChange) {
      register(name).onChange(e);
    }
    // Call the passed onChange prop if it exists
    if (onChange) {
      onChange(e);
    }
  };

  const displayDate = isDateType && hasValue && !isFocused && value ? formatRegistrationDate(value) : "";

  return (
    <div className="space-y-2 relative">
      {(label || icon) && (
        <div className="flex items-center gap-2">
          {icon && <span className="text-white">{icon}</span>}
          {label && (
            <label className="text-sm text-gray-300 font-medium">
              {label} <span className="text-red-500">*</span>
            </label>
          )}
        </div>
      )}
      <div className="relative">
        <input
          {...register(name, rules)}
          type={resolvedType}
          placeholder={placeholder || (label ? `Enter ${label.toLowerCase()}` : "")}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          className={`w-full bg-[#050B14]/60 border rounded-xl px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-gray-600
          ${error 
            ? "border-red-500/50 bg-red-500/5 focus:border-red-500" 
            : isFocused 
              ? "border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)] bg-[#050B14]/80" 
              : "border-white/5 hover:border-white/20"
          }
          ${isDateType && hasValue && !isFocused ? "text-transparent [&::-webkit-datetime-edit]:opacity-0 select-none" : ""}
          `}
        />

        {displayDate && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none">
            {displayDate}
          </div>
        )}
        
        {/* Right-side affordances (success + password toggle) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {!error && hasValue && !isPasswordField && !isDateType && (
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.78 21.78 0 0 1 5.06-6.94" />
                  <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.78 21.78 0 0 1-2.11 3.38" />
                  <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                  <path d="M1 1l22 22" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default DarkInput;
