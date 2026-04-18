import Image from "next/image";
import React from "react";

const AddSection = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[750px]">
      <Image
        src="/images/add-banner.png"
        alt="Add for player"
        fill
        priority
        className="object-cover"
      />
    </div>
  );
};

export default AddSection;
