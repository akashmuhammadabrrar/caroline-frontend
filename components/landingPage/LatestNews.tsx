"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Image from "next/image";
import SectionTitel from "@/components/reuseable/SectionTitel";
import { useAppSelector } from "@/redux/hooks";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { useGetLatestNewsQuery } from "@/redux/features/home/homeApi";
import { format, parseISO } from "date-fns";

export default function LatestNews() {
  const theme = useAppSelector((state) => state.theme);
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  const { data: newsData, isLoading } = useGetLatestNewsQuery();
  
  console.log(newsData, "newsData");

  const newsItems = useMemo(() => {
    const items = [...(newsData?.articles || newsData?.data || [])];
    return items.sort((a: any, b: any) => {
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
          <div className="mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {newsItems.slice(0, 2).map((item: any) => (
                <div
                  key={item.unique_id || item.id}
                  className="overflow-hidden rounded-2xl md:col-span-1 border border-cyan-500/10 transition-all duration-300 hover:border-cyan-500/40 group"
                  style={{ backgroundColor: item.background_color || "var(--bg-card,#12143A)" }}
                >
                  <div className="p-8 flex flex-col h-full min-h-[300px] justify-between relative overflow-hidden">
                    {/* Background Image with opacity */}
                    {item.image_url && (
                      <div className="absolute inset-0 z-0 opacity-20 transition-transform duration-500 group-hover:scale-110">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-br from-[#12143A] via-[#12143A]/80 to-transparent z-1" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-cyan-400 text-xs uppercase tracking-widest font-bold px-3 py-1 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                          {item.category || "News Update"}
                        </span>
                        {item.date_published && (
                          <span className="text-gray-400 text-[10px] font-bold">
                            {format(parseISO(item.date_published), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>

                      <h2 
                        className="text-2xl md:text-3xl font-black mb-6 leading-tight"
                        style={{ color: item.title_color || "white" }}
                      >
                        {item.title}
                      </h2>
                      
                      <p className="text-gray-400 text-lg leading-relaxed mb-8 line-clamp-2">
                        {item.excerpt || item.subtitle}
                      </p>
                    </div>

                    <div className="mt-auto relative z-10">
                      <button
                        onClick={() => handleStoryDetails(item.unique_id)}
                        className="text-sm font-bold uppercase tracking-widest text-[#00E5FF] hover:text-white transition-colors duration-300 flex items-center gap-2 group-hover:translate-x-2 transition-transform"
                      >
                        Read Full Story <span className="text-xl">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center items-center w-full mt-4">
          <div className="flex justify-center">
            <button
              onClick={handleViewAllNews}
                     className="px-10 py-3 bg-linear-to-r from-cyan-500 to-purple-600 rounded-full text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-3"
            >
              View All News <ArrowRight size={18}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
