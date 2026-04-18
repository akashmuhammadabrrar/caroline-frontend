"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useGetPublicSettingsQuery } from "@/redux/features/home/homeApi";

const BASE_URL = "http://98.81.136.120:9000";

interface BrandedLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "vertical" | "stacked";
  className?: string;
  hideNameOnMobile?: boolean;
  hideFallback?: boolean;
  width?: number;
  height?: number;
}

const BrandedLogo: React.FC<BrandedLogoProps> = ({
  size = "md",
  variant = "horizontal",
  className = "",
  hideNameOnMobile = false,
  hideFallback = false,
  width,
  height,
}) => {
  const { data: settings } = useGetPublicSettingsQuery();
  const name = String(settings?.platformName || "NextGen Pros");
  const firstSpaceIndex = name.indexOf(" ");

  const defaultSize = {
    sm: 28,
    md: 52,
    lg: 72
  }[size];

  const finalWidth = width || defaultSize;
  const finalHeight = height || defaultSize;

  const logoSrc = settings?.platformLogo 
    ? (settings.platformLogo.startsWith('http') ? settings.platformLogo : `${BASE_URL}${settings.platformLogo}`)
    : (hideFallback ? null : "/images/logo.png");

  const renderName = () => {
    if (firstSpaceIndex === -1) {
      return (
        <span className={`font-bold ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'} ${hideNameOnMobile ? 'hidden sm:inline' : ''}`}>
          {name}
        </span>
      );
    }

    const firstPart = name.substring(0, firstSpaceIndex);
    const secondPart = name.substring(firstSpaceIndex + 1);

    if (variant === "stacked") {
      return (
        <div className={`flex flex-col leading-none ${hideNameOnMobile ? 'hidden sm:flex' : ''}`}>
          <span className="text-white font-bold text-base lg:text-lg tracking-tight">
            {firstPart}
          </span>
          <span
            className="font-black text-[11px] lg:text-sm tracking-widest uppercase"
            style={{ color: "var(--primary-cyan, #00E5FF)" }}
          >
            {secondPart}
          </span>
        </div>
      );
    }

    return (
      <span className={`font-bold ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'} ${hideNameOnMobile ? 'hidden sm:inline' : ''}`}>
        {firstPart}{" "}
        <span style={{ color: "var(--primary-cyan, #00E5FF)" }}>
          {secondPart}
        </span>
      </span>
    );
  };

  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      {logoSrc && (
        <div style={{ height: finalHeight, width: finalWidth, display: 'flex', alignItems: 'center' }}>
          <Image
            src={logoSrc}
            alt={settings?.platformName || "Logo"}
            width={finalWidth}
            height={finalHeight}
            style={{ width: "auto", height: "auto", maxHeight: finalHeight }}
            className="object-contain opacity-95 hover:opacity-100 transition-opacity"
            priority
            unoptimized
          />
        </div>
      )}
      <div className="text-white">
        {renderName()}
      </div>
    </Link>
  );
};

export default BrandedLogo;
