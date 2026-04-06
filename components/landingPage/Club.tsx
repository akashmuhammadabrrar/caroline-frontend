"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lock, Loader2 } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useGetFeaturedClubsQuery } from "@/redux/features/admin/adminHomePageApi";

export default function Club() {
  const [activeTab, setActiveTab] = useState("clubs"); // "clubs" or "academies"
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [mounted, setMounted] = useState(false);

  const theme = useAppSelector((state) => state.theme);
  const { data: featuredClubs = [], isLoading } = useGetFeaturedClubsQuery();
  console.log(featuredClubs, "feature club data");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update visibleCount based on screen width
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCount(1);
      else if (width < 1024) setVisibleCount(2);
      else setVisibleCount(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  // Filter active and by type
  const filteredItems = featuredClubs.filter((item) => {
    if (item.is_active === false) return false;

    // Attempt to match tab to club_type.
    // Fallback: if 'club_type' isn't explicitly 'Academy', treat as 'Club'
    const type = item.club_type?.toLowerCase() || "club";
    if (activeTab === "academies") {
      return type.includes("academy");
    } else {
      return !type.includes("academy");
    }
  });

  const maxIndex = Math.max(filteredItems.length - visibleCount, 0);

  // Reset index when tab changes to avoid out-of-bounds
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  if (!mounted) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? maxIndex : prev - 1));
  };

  const visibleClubs = filteredItems.slice(
    currentIndex,
    currentIndex + visibleCount,
  );

  return (
    <section
      id="academies"
      className="py-16 bg-[var(--bg-dark,#07142b)] text-white"
    >
      <div className="container mx-auto px-4">
        {/* Tabs */}
        <div className="flex justify-center mb-6 text-white">
          <div className="flex bg-[var(--bg-card,#12143A)] rounded-lg overflow-hidden border border-white/10 px-2 shadow-sm">
            <button
              onClick={() => setActiveTab("clubs")}
              className={`px-6 py-2 text-sm font-medium transition-colors  ${
                activeTab === "clubs"
                  ? "bg-[#1A1C3D] text-white border-b-2 rounded-md border-cyan-400 m-2 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Clubs
            </button>
            {/* <button
              onClick={() => setActiveTab("academies")}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === "academies"
                  ? "bg-[#1A1C3D] text-white border-b-2 border-cyan-400 m-2 rounded-md shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Academies
            </button> */}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-center text-gray-400 mb-10 pb-4 max-w-2xl mx-auto">
          Connect with top clubs and academies from around the world.
        </p>

        {/* Carousel / Loading Area */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-gray-400 h-48 flex flex-col justify-center items-center border border-[#12143A] rounded-2xl bg-[#090C22]">
            <p>No featured {activeTab} available at the moment.</p>
          </div>
        ) : (
          <div className="relative flex items-center">
            {maxIndex > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 lg:-left-12 z-10 w-10 h-10 flex items-center justify-center text-white hover:text-[var(--primary-cyan)] hover:bg-white/5 transition-colors bg-[var(--bg-card,#12143A)] border border-white/10 rounded-full shadow-lg"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="flex gap-4 justify-center mx-12 w-full overflow-hidden">
              {visibleClubs.map((club, i) => (
                <div
                  key={club.id || i}
                  className="flex-1 min-w-[150px] sm:min-w-[180px] bg-[var(--bg-card,#12143A)] border border-white/5 hover:border-[var(--primary-cyan)]/30 md:min-w-[220px] rounded-xl p-6 text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center p-2 bg-white/5 rounded-full">
                    <img
                      src={club.club_logo || "/images/placeholder.png"}
                      alt={club.club_name}
                      className="max-w-full max-h-full object-contain drop-shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://ui-avatars.com/api/?name=" +
                          club.club_name +
                          "&background=0D8ABC&color=fff";
                      }}
                    />
                  </div>
                  <h3 className="font-display font-bold text-white text-sm mb-1 truncate">
                    {club.club_name}
                  </h3>
                  <p className="text-cyan-400 text-[11px] font-medium tracking-wider uppercase">
                    {club.club_type ||
                      (activeTab === "clubs" ? "Club" : "Academy")}
                  </p>
                </div>
              ))}
            </div>

            {maxIndex > 0 && (
              <button
                onClick={nextSlide}
                className="absolute right-0 lg:-right-12 z-10 w-10 h-10 flex items-center justify-center text-white hover:text-[var(--primary-cyan)] hover:bg-white/5 transition-colors bg-[var(--bg-card,#12143A)] border border-white/10 rounded-full shadow-lg"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-12">
          <button className="px-8 py-2.5 border border-white/10 bg-[var(--bg-card,#12143A)] hover:bg-white/5 hover:border-[var(--primary-cyan)] rounded-full transition-all flex items-center gap-2 text-white font-medium shadow-sm">
            View All {activeTab === "clubs" ? "Clubs" : "Academies"}{" "}
            <Lock size={14} className="text-cyan-400" />
          </button>
        </div>
      </div>
    </section>
  );
}
