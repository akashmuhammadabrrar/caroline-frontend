import React from "react";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

const SectionTitel = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="">
      <h2 className=" font-bold text-6xl mb-3 inline-block pb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">{title}</h2>

      {subtitle && (
        <p className="text-gray-400 mt-2 max-w-xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
};

export default SectionTitel;