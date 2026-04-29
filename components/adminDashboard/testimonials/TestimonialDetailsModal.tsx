/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { 
  X, 
  Loader2, 
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Star,
  Quote
} from 'lucide-react';
import { useGetTestimonialByIdQuery } from '@/redux/features/admin/adminTestimonialApi';
import { format } from 'date-fns';

interface TestimonialDetailsModalProps {
  testimonialId: number | string;
  onClose: () => void;
}

const TestimonialDetailsModal: React.FC<TestimonialDetailsModalProps> = ({ testimonialId, onClose }) => {
  const { data: response, isLoading, isError } = useGetTestimonialByIdQuery(testimonialId);
  const t = response?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Testimonial Details</h2>
            <p className="text-gray-400 text-sm mt-0.5">Full view of the client feedback and profile</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-gray-400">Fetching testimonial details...</p>
            </div>
          ) : isError || !t ? (
            <div className="py-20 text-center">
              <p className="text-red-400">Failed to load testimonial details.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-6 p-6 bg-[#0a0c16] border border-gray-800 rounded-2xl">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/20">
                  <img 
                    src={t.image_url || 'https://via.placeholder.com/150'} 
                    alt={t.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} 
                      />
                    ))}
                    <span className="text-gray-400 text-xs ml-2">({t.rating}/5 Rating)</span>
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <div className="relative bg-[#0a0c16] border border-gray-800 rounded-2xl p-8 pt-12">
                <Quote className="absolute top-6 left-6 w-10 h-10 text-cyan-500/10" />
                <p className="text-gray-300 text-lg italic leading-relaxed relative z-10">
                  &quot;{t.comment}&quot;
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {t.is_active ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-red-500/10 text-red-500 border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Display Order</p>
                  <div className="flex items-center gap-2 mt-1 text-white">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <p className="text-lg font-bold">{t.order}</p>
                  </div>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Created At</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-300">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <p>{format(new Date(t.created_at), 'PPP')}</p>
                  </div>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Last Updated</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-300">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <p>{format(new Date(t.updated_at), 'PPP')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialDetailsModal;
