import Image from "next/image";
import React from "react";
import { useGetPublicSettingsQuery } from "@/redux/features/home/homeApi";

const Logo = () => {
  const { data: settings } = useGetPublicSettingsQuery();

  return (
    <div>
      <div className="relative w-[140px] h-[40px]">
        <Image
          src={settings?.platformLogo || "/images/logo.png"}
          alt={settings?.platformName || "NextGen Pros Logo"}
          fill
          priority
          unoptimized
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default Logo;
