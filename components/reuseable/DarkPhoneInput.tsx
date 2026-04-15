"use client";

import React, { useState } from "react";
import { Controller, Control } from "react-hook-form";
import { countryCodes } from "@/constants/countryCodes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  label?: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  rules?: any;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  dropdownClassName?: string;
}

const DarkPhoneInput = ({
  label,
  name,
  control,
  rules,
  error,
  placeholder,
  icon,
  className,
  dropdownClassName,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2 relative w-full">
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
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => {
          // Parse value "+1 555-5555" into code and number
          const stringValue = value || "";
          let code = "+1";
          let number = "";

          // Simple parsing: if string matches a known country code at the start
          const matchedCode = countryCodes.find((c) => stringValue.startsWith(c.code + " "))?.code;
          if (matchedCode) {
            code = matchedCode;
            number = stringValue.substring(matchedCode.length + 1);
          } else {
            // fallback if no space or doesn't match
            // Try to see if it just starts with a code without space (some users might type +44123456)
            const exactCode = countryCodes.find((c) => stringValue.startsWith(c.code))?.code;
            if (exactCode && stringValue.length > exactCode.length) {
              code = exactCode;
              number = stringValue.substring(exactCode.length).trim();
            } else {
              number = stringValue;
            }
          }

          const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newCode = e.target.value;
            onChange(`${newCode} ${number}`);
          };

          const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newNumber = e.target.value;
            onChange(`${code} ${newNumber}`);
          };

          return (
            <div
              className={className || `flex items-center w-full bg-[#050B14]/60 border rounded-xl overflow-hidden transition-all duration-300
              ${
                error
                  ? "border-red-500/50 bg-red-500/5 focus-within:border-red-500"
                  : isFocused
                  ? "border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)] bg-[#050B14]/80"
                  : "border-white/5 hover:border-white/20"
              }
              `}
            >
              {/* Country Code Dropdown */}
              <div className={`relative border-r border-white/10 shrink-0 ${dropdownClassName || ''}`}>
                {/* Visual Display */}
                <div className="flex items-center gap-2 h-full py-3 pl-4 pr-10 text-white text-sm pointer-events-none">
                  {(() => {
                    const selected = countryCodes.find((c) => c.code === code) || countryCodes[0];
                    return (
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://flagcdn.com/w40/${selected.iso}.png`} 
                          alt="Flag"
                          className="w-5 h-auto rounded-[2px] shadow-sm brightness-90 group-hover:brightness-100 transition-all border border-white/10"
                        />
                        <span className="whitespace-nowrap font-medium">
                          {selected.code}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <select
                  value={code}
                  onChange={handleCodeChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#050B14] text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
                
                {/* Custom Chevron with Flag Preview */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                   <div className="flex items-center gap-1">
                      <span className="text-[10px] opacity-40">▼</span>
                   </div>
                </div>
              </div>

              {/* Number Input */}
              <input
                type="tel"
                value={number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ""); // Keep only digits
                  if (val.length <= 15) {
                    handleNumberChange({ ...e, target: { ...e.target, value: val } } as any);
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={15}
                placeholder={placeholder || (label ? `Enter ${label.toLowerCase()}` : "")}
                className="flex-1 w-full bg-transparent px-4 py-3 text-white outline-none placeholder:text-gray-600"
              />
            </div>
          );
        }}
      />

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default DarkPhoneInput;
