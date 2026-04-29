import React from 'react';

const AdBanner = () => {
  return (
    <div className="w-full max-w-[800px] mx-auto my-12 relative overflow-hidden rounded-sm bg-[#5C9A99] h-[70px] sm:h-[90px] flex items-center justify-between shadow-lg">
      {/* Ad indicator */}
      <div className="absolute top-0 right-0 bg-white/80 text-[10px] px-1 text-gray-600 z-30 flex items-center gap-1">
        Ad <span className="text-[8px]">ℹ</span>
      </div>
      
      {/* Left content */}
      <div className="flex items-center gap-3 sm:gap-6 px-4 sm:px-8 z-20 w-1/2 sm:w-auto">
        <h2 className="text-[#F1885B] text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
          5 FISH
        </h2>
        <div className="text-white text-xs sm:text-sm font-medium leading-tight">
          You&apos;ll Want to<br />Try Next
        </div>
      </div>

      {/* Right Content - Button and Background Image */}
      <div className="relative h-full flex-1 flex justify-end items-center px-4 sm:px-8 z-20">
        <button className="bg-[#EF6161] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-red-500 transition-colors shadow-md z-30 whitespace-nowrap">
          View Recipes
        </button>
      </div>

      {/* Background image on the right */}
      <div 
        className="absolute right-0 top-0 w-[55%] h-full z-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop')", // Placeholder fish/food image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
};

export default AdBanner;
