"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Image from "next/image";
import SectionTitel from "@/components/reuseable/SectionTitel";
import { Loader2, ArrowRight } from "lucide-react";
import { useGetLatestNewsQuery } from "@/redux/features/home/homeApi";
import { parseISO } from "date-fns";
import AdBanner from "./AdBanner";
import { NewsArticle } from "@/types/home";

export default function LatestNews() {
  const router = useRouter();
  const { data: newsData, isLoading } = useGetLatestNewsQuery();

  const newsItems = useMemo(() => {
    const items = [...(newsData?.articles || newsData?.data || [])];
    return items.sort((a, b) => {
      const dateA = a.date_published ? parseISO(a.date_published).getTime() : 0;
      const dateB = b.date_published ? parseISO(b.date_published).getTime() : 0;
      return dateB - dateA;
    });
  }, [newsData]);

  const handleViewAllNews = () => {
    router.push("/latest-news");
  };

  const handleStoryDetails = (unique_id: string) => {
    router.push(`/latest-news/${unique_id}`);
  };

  return (
    <div className="bg-[var(--bg-dark,#07142b)] text-white">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-9">
          <SectionTitel
            title="LATEST NEWS"
            subtitle="Stay updated with training tips, nutrition advice, and gear reviews."
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center text-gray-400 h-32 flex flex-col justify-center">
            <p>No latest news available right now.</p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-white p-3 md:p-4 rounded-3xl w-full max-w-3xl mx-auto shadow-2xl">
              <div className="flex flex-col gap-3 md:gap-4">
                {/* Top News */}
                {newsItems[0] && (
                  <div
                    key={newsItems[0].unique_id || newsItems[0].id}
                    onClick={() => handleStoryDetails(newsItems[0].unique_id)}
                    className="relative w-full h-[250px] md:h-[350px] rounded-[1.25rem] overflow-hidden cursor-pointer group"
                  >
                    <Image
                      src={newsItems[0].image_url || "/images/event-card.jpg"}
                      alt={newsItems[0].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full md:w-[90%]">
                      <h2 className="text-white text-xl md:text-[26px] font-extrabold leading-tight drop-shadow-md">
                        {newsItems[0].title}
                      </h2>
                    </div>
                  </div>
                )}

                {/* Bottom row */}
                {newsItems.length > 1 && (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {newsItems.slice(1, 3).map((item: NewsArticle) => (
                      <div
                        key={item.unique_id || item.id}
                        onClick={() => handleStoryDetails(item.unique_id)}
                        className="flex flex-col cursor-pointer group"
                      >
                        <div className="relative w-full h-[130px] md:h-[180px] rounded-[1.25rem] overflow-hidden mb-3">
                          <Image
                            src={item.image_url || "/images/event-card.jpg"}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            unoptimized
                          />
                          {item.category && (
                            <div className="absolute top-3 left-3 bg-linear-to-r from-fuchsia-600 to-pink-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest z-10 shadow-sm">
                              {item.category}
                            </div>
                          )}
                        </div>
                        <div className="px-1 md:px-2 pb-2">
                          <h3 className="text-gray-900 font-extrabold text-sm md:text-[15px] leading-snug line-clamp-3 group-hover:text-cyan-600 transition-colors">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center w-full mt-4">
          <div className="flex justify-center">
            <button
              onClick={handleViewAllNews}
              className="px-10 py-3 bg-linear-to-r from-cyan-500 to-purple-600 rounded-full text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-3"
            >
              View All News <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

       <div className="container mx-auto px-4 md:px-0">
          <AdBanner position="BOTTOM" />
        </div>
    </div>
  );
}
