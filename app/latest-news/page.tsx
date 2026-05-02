"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Clock, BookOpen, ExternalLink } from "lucide-react";
import { 
  useGetLatestNewsQuery 
} from "@/redux/features/home/homeApi";
import Navbar from "@/components/sheard/Navbar";
import Footer from "@/components/sheard/Footer";
import { useRouter } from "next/navigation";
import { 
  formatNewsCategory, 
  formatNewsExcerpt, 
  formatNewsImage 
} from "@/utils/news";
import { NewsArticle } from "@/types/home";

const CATEGORIES = ["All", "Training", "Nutrition", "Academies", "Gear", "News"];

export default function LatestNewsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const { data: newsData, isLoading } = useGetLatestNewsQuery();
  
  // Sort and initial data
  const newsItems = useMemo(() => {
    const items = [...(newsData?.articles || newsData?.data || [])];
    return items.sort((a, b) => {
      const dateA = a.date_published ? parseISO(a.date_published).getTime() : 0;
      const dateB = b.date_published ? parseISO(b.date_published).getTime() : 0;
      return dateB - dateA;
    });
  }, [newsData]);
  
  // Filter by category
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return newsItems;
    return newsItems.filter((item) => {
      const cat = formatNewsCategory(item.category);
      return cat.toLowerCase() === activeCategory.toLowerCase();
    });
  }, [newsItems, activeCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const setPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#050B14] flex flex-col pt-32 text-white">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 mb-20 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors mb-8 bg-cyan-400/10 px-4 py-2 rounded-full border border-cyan-400/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            LATEST <span className="bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">NEWS</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Stay updated with training tips, nutrition advice, and gear reviews. Our blog shares the latest insights to help you excel in your professional journey.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-cyan-500 border-cyan-400 text-[#050B14] shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  : "bg-[#12143A]/50 border-[#1E2554] text-gray-400 hover:border-cyan-400/50 hover:text-cyan-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#121433] border border-[#1E2554] rounded-[32px] p-20 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-gray-400">We couldn't find any news articles in the {activeCategory} category.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* News List */}
            <div className="grid grid-cols-1 gap-8">
              {currentItems.map((item: NewsArticle) => (
                <div 
                  key={item.unique_id || item.id}
                  className="bg-[#12143A] border border-[#1E2554] rounded-[32px] overflow-hidden hover:border-cyan-400/30 transition-all duration-500 group relative flex flex-col md:flex-row h-full md:min-h-[300px] shadow-2xl shadow-black/40"
                >
                  {/* Text Content */}
                  <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                          {formatNewsCategory(item.category)}
                        </span>
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                           <Clock size={12} className="text-cyan-400" />
                           {item.read_time || "5 min read"}
                        </span>
                      </div>

                      <h2 
                        className="text-2xl md:text-3xl font-black mb-6 leading-tight transition-colors duration-300 group-hover:text-cyan-400"
                        style={{ color: item.title_color || "white" }}
                      >
                        {item.title}
                      </h2>
                      
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 line-clamp-3">
                        {formatNewsExcerpt(item.excerpt)}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <Link 
                        href={`/latest-news/${item.unique_id}`}
                        className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#00F6FF] group/link"
                      >
                        Read More
                        <span className="p-2 rounded-lg bg-cyan-400/10 group-hover/link:bg-cyan-400 group-hover/link:text-black transition-all duration-300">
                             <ExternalLink size={14} />
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Image Container */}
                  <div className="md:w-[40%] relative min-h-[250px] md:min-h-full overflow-hidden">
                    <Image
                      src={formatNewsImage(item.image_url)}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-[#12143A] via-transparent to-transparent hidden md:block" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-20 gap-3">
                <button
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-[#1E2554] bg-[#12143A] text-gray-400 hover:text-cyan-400 hover:border-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPage(page)}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl border text-sm font-black transition-all duration-300 ${
                        currentPage === page
                          ? "bg-cyan-400 border-cyan-400 text-[#050B14] shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                          : "border-[#1E2554] bg-[#12143A] text-gray-400 hover:text-white hover:border-cyan-400/50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-[#1E2554] bg-[#12143A] text-gray-400 hover:text-cyan-400 hover:border-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
