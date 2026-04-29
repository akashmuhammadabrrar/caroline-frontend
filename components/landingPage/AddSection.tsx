"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useGetAllAdsQuery } from "@/redux/features/ads/ads";

const AddSection = () => {
  const { data, isLoading, isError } = useGetAllAdsQuery();

  if (isLoading) return <div className="w-full h-40 flex items-center justify-center bg-transparent"><p className="text-muted-foreground animate-pulse">Loading ads...</p></div>;
  if (isError || !data || data.advertisements.length === 0) return null;

  // Dynamic heights for the masonry gallery effect
  const heights = [
    "h-[300px]", 
    "h-[450px]", 
    "h-[250px]", 
    "h-[380px]", 
    "h-[280px]", 
    "h-[350px]"
  ];

  return (
    <div className="w-full bg-transparent mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-12">Special <span className="text-primary">Offers</span></h2>
        
        {/* CSS Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {data.advertisements.map((ad, index) => (
            <Link
              key={ad.ad_id}
              href={ad.target_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative block w-full rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 mb-6 break-inside-avoid ${heights[index % heights.length]}`}
            >
              <Image
                src={ad.ad_image_url}
                alt={ad.title || "Advertisement"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-white font-bold text-xl leading-tight drop-shadow-md">{ad.title}</span>
                <span className="text-primary text-sm mt-2 flex items-center font-semibold uppercase tracking-wider">
                  Explore
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddSection;
