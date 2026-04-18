"use client";

import React from "react";

interface StepConfig {
  num: number;
  label: string;
}

interface Props {
  step: number; // 0 to 4
  isMinor: boolean;
  stepsOverride?: StepConfig[];
}

const StepIndicator = ({ step, isMinor }: Props) => {
  // Step 0 is the initial account creation which doesn't show the multi-step indicator in Figma
  if (step === 0) return null;

  const totalSteps = isMinor ? 4 : 3;
  const percentage = Math.round((step / totalSteps) * 100);

  return (
    <div className="w-full mb-10 space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-xs font-medium text-gray-400 tracking-wider">
          Step {step} of {totalSteps}
        </span>
        <span className="text-xs font-semibold text-gray-300">
          {percentage}% Complete
        </span>
      </div>
      
      <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-linear-to-r from-cyan-500 to-cyan-300 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StepIndicator;
