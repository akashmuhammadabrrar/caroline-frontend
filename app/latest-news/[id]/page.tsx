"use client";

import { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Clock, Share2, Eye } from "lucide-react";
import { useGetNewsByIdQuery } from "@/redux/features/home/homeApi";
import Navbar from "@/components/sheard/Navbar";
import Footer from "@/components/sheard/Footer";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { parseISO } from "date-fns";

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  
  const { data: articleData, isLoading } = useGetNewsByIdQuery(unwrappedParams.id);
  const article = articleData?.data;

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isLoading]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#050B14] flex flex-col pt-32">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#050B14] flex flex-col pt-32">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Article not found</h1>
          <p className="text-gray-400 mb-8">The news article you are looking for does not exist or has been removed.</p>
          <Link href="/latest-news" className="text-cyan-400 hover:underline inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Latest News
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Create sanitized HTML content
  const createMarkup = (html: string) => {
    return {
      __html: DOMPurify.sanitize(html),
    };
  };

  return (
    <main className="min-h-screen bg-[#050B14] flex flex-col pt-32">
      <Navbar />
      
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 mb-16">
        <Link 
          href="/latest-news" 
          className="inline-flex items-center text-sm font-bold text-cyan-400 hover:text-white transition-all mb-10 group"
        >
          <div className="w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mr-3 group-hover:bg-cyan-400 group-hover:text-[#050B14] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Latest News
        </Link>
        
        <article className="bg-[#12143A] rounded-[2rem] overflow-hidden border border-[#1E2554] shadow-2xl">
          {/* Cover Image */}
          <div className="relative w-full min-h-[300px] h-[50vh] sm:min-h-[400px] sm:h-[500px] md:h-[600px]">
            <Image
              src={article.image_url || "/images/event-banner.jpg"}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1536px) 100vw, 1536px"
              className="object-cover"
              unoptimized
            />
            {/* Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12143A] via-[#12143A]/60 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 pb-8 sm:pb-12">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full inline-block mb-4 sm:mb-6 shadow-xl">
                {article.category}
              </span>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 sm:mb-8 max-w-4xl">
                {article.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-slate-300 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 p-[2px] shadow-lg">
                    <div className="w-full h-full rounded-full bg-[#12143A] flex items-center justify-center text-white text-[10px] sm:text-xs font-black">
                      {article.author ? article.author.charAt(0).toUpperCase() : "A"}
                    </div>
                  </div>
                  <span className="text-white">{article.author || "Admin"}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Clock size={16} className="w-4 h-4" />
                    <span>{article.date_published ? format(parseISO(article.date_published), "MMM d, yyyy") : "Recent"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-60">
                    <Clock size={16} className="w-4 h-4" />
                    <span>{article.read_time || "4 min read"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-10 lg:p-16 md:max-w-5xl mx-auto relative bg-[#12143A]">

            
            {/* Excerpt emphasis */}
            {article.excerpt && (
              <div className="relative mb-10 sm:mb-16">
                <div className="absolute -left-4 sm:-left-6 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full" />
                <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white leading-relaxed italic pl-4 sm:pl-6">
                  &ldquo;{article.excerpt}&rdquo;
                </p>
              </div>
            )}
            
            {/* Main Content Body */}
            <div 
              className="prose prose-invert text-base sm:prose-lg md:prose-xl lg:prose-2xl max-w-none 
                prose-p:text-white prose-p:leading-[1.6] sm:prose-p:leading-[1.8] prose-p:font-medium
                prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl sm:prose-img:rounded-[2rem] prose-img:border prose-img:border-[#1E2554] prose-img:shadow-2xl"
              style={{ color: (article as any).content_color || (article as any).body_color || "white" }}
              dangerouslySetInnerHTML={createMarkup(article.content)}
            />
            
            {/* Tags section */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-[#1E2554]">
                <h3 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-6">Related Tags</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {article.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/5 border border-cyan-400/10 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-cyan-400 hover:text-[#050B14] transition-all cursor-pointer shadow-sm"
                    >
                      # {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
      
      <Footer />
    </main>
  );
}
