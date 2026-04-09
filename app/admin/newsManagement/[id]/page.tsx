"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag as TagIcon, 
  Eye, 
  Share2, 
  Clock, 
  TrendingUp,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useGetNewsArticleDetailsQuery } from '@/redux/features/admin/adminNewsApi';

export default function ArticleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data, isLoading, isError } = useGetNewsArticleDetailsQuery(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D2C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
          <p className="text-gray-400 text-lg font-medium">Loading article content...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="min-h-screen bg-[#0B0D2C] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Article Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md">The article you're looking for might have been removed or the ID is invalid.</p>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-gray-800"
          >
            <ArrowLeft size={18} />
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  const article = data.data;

  return (
    <div className="min-h-screen bg-[#0B0D2C] text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-[#0B0D2C]/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-gray-800/50 text-sm font-bold"
          >
            <ArrowLeft size={16} />
            Back to Articles
          </button>
          
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
              article.status === 'PUBLISHED' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {article.status}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-12 pb-24">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-0">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-10 py-8 border-t border-gray-800/50">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-500/30">
                <img 
                  src={`https://ui-avatars.com/api/?name=${article.author}&background=6366f1&color=fff`}
                  alt={article.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-lg leading-none mb-1">{article.author}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Author</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3 text-gray-400">
              <Calendar className="text-cyan-400" size={20} />
              <span className="text-sm font-medium">
                Published on {new Date(article.date_published || article.created_at).toISOString().split('T')[0]}
              </span>
            </div>

            {/* Trending */}
            <div className="flex items-center gap-3 text-gray-400">
              <TrendingUp className="text-emerald-400" size={20} />
              <span className="text-sm font-medium">
                Trending in {article.category}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto h-px bg-gray-800/50 w-full mb-10" />

        {/* Metrics & Actions Cards */}
        <div className="max-w-7xl mx-auto mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Views Card */}
            <div className="bg-[#171b2f] border border-gray-800/50 rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-cyan-500/30">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Eye size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Views</p>
                <p className="text-xl font-black text-white">{(article.views ?? 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Engagement Card */}
            <div className="bg-[#171b2f] border border-gray-800/50 rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-emerald-500/30">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Engagement</p>
                <p className="text-xl font-black text-emerald-400">{article.engagement_rate}%</p>
              </div>
            </div>

            {/* Read Time Card */}
            <div className="bg-[#171b2f] border border-gray-800/50 rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-orange-500/30">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Read Time</p>
                <p className="text-xl font-black text-white">{article.read_time ?? 'N/A'}</p>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-[#171b2f] border border-gray-800/50 rounded-2xl p-3 flex items-center justify-between gap-2">
              <button 
                onClick={() => router.push(`/admin/newsManagement/${id}/edit`)}
                className="flex-1 flex items-center justify-center gap-2 h-full bg-cyan-500 hover:bg-cyan-400 text-[#0B0D2C] rounded-xl font-black transition-all transform hover:scale-[1.02] active:scale-95 text-sm shadow-lg shadow-cyan-500/10"
              >
                Edit Content
              </button>
              <button className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-gray-800/50">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.image_url && (
          <div className="max-w-7xl mx-auto mb-14 rounded-[2rem] overflow-hidden border border-gray-800/50 bg-[#171b2f] relative aspect-video shadow-2xl group">
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0B0D2C] to-transparent opacity-20" />
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg prose-headings:text-white prose-strong:text-cyan-400 prose-headings:font-black">
            {article.content.split('\n').map((para, i) => {
              if (!para.trim()) return <br key={i} />;
              
              const trimmedPara = para.trim();
              
              // Identification of "X. Title" format for cards
              const drillMatch = trimmedPara.match(/^(\d+\.\s+)(.*)/);
              if (drillMatch) {
                return (
                  <div key={i} className="my-10 p-10 rounded-[2rem] bg-[#12142d] border border-gray-800/50 hover:border-cyan-500/30 transition-all group shadow-xl">
                    <h3 className="text-2xl font-black text-cyan-400 mb-4 group-hover:translate-x-1 transition-transform inline-block">
                      {trimmedPara}
                    </h3>
                  </div>
                );
              }
              
              // Identification of headers
              if (trimmedPara.length < 80 && !trimmedPara.endsWith('.') && i > 0) {
                return <h2 key={i} className="text-3xl font-black mt-20 mb-10 text-white tracking-tight">{trimmedPara}</h2>;
              }

              return <p key={i} className="mb-6 leading-relaxed text-gray-300">{trimmedPara}</p>;
            })}
          </div>

          {/* Footer Navigation */}
          <div className="mt-20 pt-12 border-t border-gray-800/50">
            {/* Tags */}
            {article.tags && (
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(article.tags) 
                  ? article.tags 
                  : typeof article.tags === 'string' 
                    ? (article.tags as any).split(',').filter(Boolean) 
                    : []
                ).map((tag: any, i: number) => (
                  <span key={i} className="px-4 py-2 bg-[#171b2f] border border-gray-800 rounded-xl text-xs font-bold text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-default">
                    #{typeof tag === 'string' ? tag.trim() : String(tag)}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-12 flex items-center justify-between">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold"
              >
                <ArrowLeft size={16} />
                Return to News Management
              </button>
              <p className="text-xs text-gray-600 font-medium italic">
                Last updated on {new Date(article.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
