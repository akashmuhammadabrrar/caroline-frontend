"use client";

import React, { useState, useEffect } from 'react';
import { useGetPublicSpecialAdsQuery, useGetPublicBottomSpecialAdsQuery, SpecialAd } from '@/redux/features/ads/specialAdsApi';
import { ExternalLink, Info } from 'lucide-react';

const AdBanner = ({ position = 'TOP' }: { position?: 'TOP' | 'BOTTOM' }) => {
  const topQuery = useGetPublicSpecialAdsQuery(undefined, { skip: position !== 'TOP' });
  const bottomQuery = useGetPublicBottomSpecialAdsQuery(undefined, { skip: position !== 'BOTTOM' });
  
  const { data, isLoading, error } = position === 'TOP' ? topQuery : bottomQuery;
  const [currentIndex, setCurrentIndex] = useState(0);

  const ads = data?.advertisements || (data as any)?.data || [];

  useEffect(() => {
    if (error) console.error(`AdBanner (${position}) Error:`, error);
    if (data) console.log(`AdBanner (${position}) Data:`, data);
  }, [data, error, position]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto my-8 h-[80px] sm:h-[100px] bg-gray-800/50 animate-pulse rounded-xl" />
    );
  }

  if (ads.length === 0) {
    // Fallback static banner if no ads are available
    return (
      <div className="w-full max-w-[1200px] mx-auto my-12 relative overflow-hidden rounded-xl bg-[#5C9A99] h-[70px] sm:h-[90px] flex items-center justify-between shadow-2xl">
        <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-md text-[10px] px-2 py-0.5 text-white z-30 flex items-center gap-1 rounded-bl-lg font-medium">
          Sponsored <Info className="w-2.5 h-2.5" />
        </div>
        
        <div className="flex items-center gap-4 sm:gap-8 px-6 sm:px-12 z-20">
          <h2 className="text-[#F1885B] text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">
            5 FISH
          </h2>
          <div className="text-white text-xs sm:text-sm font-medium leading-tight">
            Premium Seafood<br />Delivery Near You
          </div>
        </div>

        <div className="relative h-full flex-1 flex justify-end items-center px-6 sm:px-12 z-20">
          <button className="bg-[#EF6161] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-red-500 transition-all hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap">
            Order Now
          </button>
        </div>

        <div 
          className="absolute right-0 top-0 w-[60%] h-full z-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent"></div>
        </div>
      </div>
    );
  }

  const currentAd = ads[currentIndex];

  return (
    <div className="w-full max-w-[1200px] mx-auto my-12 group">
      <a 
        href={currentAd.target_link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative overflow-hidden rounded-xl bg-[#1a1c2e] h-[80px] sm:h-[100px] shadow-2xl transition-all duration-500 hover:shadow-cyan-500/10 border border-white/5"
      >
        {/* Ad indicator */}
        <div className="absolute top-0 right-0 bg-black/40 backdrop-blur-md text-[10px] px-2 py-1 text-white/80 z-30 flex items-center gap-1 rounded-bl-lg font-medium tracking-wide">
          AD <Info className="w-2.5 h-2.5" />
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-between px-6 sm:px-12">
          <div className="flex flex-col">
            <h2 className="text-white text-lg sm:text-2xl font-bold tracking-tight drop-shadow-lg group-hover:text-cyan-400 transition-colors">
              {currentAd.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/60 text-[10px] sm:text-xs font-medium uppercase tracking-widest">Limited Offer</span>
              <div className="w-8 h-[1px] bg-cyan-500/50"></div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-white/40 text-[10px]">
              <ExternalLink className="w-3 h-3" />
              Visit Site
            </div>
            <button className="bg-cyan-500 text-white px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-2">
              Learn More
            </button>
          </div>
        </div>

        {/* Background Image with Mask */}
        <div 
          className="absolute inset-0 z-10 transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${currentAd.special_ad_image_url || (currentAd as any).ad_image_url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Gradient Overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-transparent"></div>
        </div>

        {/* Slide Indicators for multiple ads */}
        {ads.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
            {ads.map((_: SpecialAd, idx: number) => (
              <div 
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-4 bg-cyan-500' : 'w-1 bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </a>
    </div>
  );
};

export default AdBanner;
