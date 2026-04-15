 "use client";

import React, { useState } from "react";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  register: any;
  name: string;
  options: { label: string; value: string }[];
  error?: string;
  icon?: React.ReactNode;
  rules?: any;
}

const DarkSelect = ({
  label,
  register,
  name,
  options,
  error,
  icon,
  rules,
  ...props
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2 w-full relative">
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <label className="text-sm text-gray-300 font-medium">
          {label} <span className="text-red-500">*</span>
        </label>
      </div>
      <div className="relative">
        <select
          {...register(name, rules)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-[#050B14]/60 border rounded-xl px-4 py-3 text-white outline-none transition-all duration-300 appearance-none
          ${error 
            ? "border-red-500/50 bg-red-500/5 focus:border-red-500" 
            : isFocused 
              ? "border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)] bg-[#050B14]/80" 
              : "border-white/5 hover:border-white/20"
          }
          `}
          {...props}
        >
          <option value="" disabled hidden className="bg-[#050B14]">
            Select {label}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#050B14] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom chevron icon for select */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition-colors duration-300">
          <svg 
            className={`fill-current h-4 w-4 transition-transform duration-300 ${isFocused ? 'text-cyan-400 rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
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

export default DarkSelect;
