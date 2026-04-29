/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { 
  X, 
  Loader2, 
  ExternalLink,
  MousePointerClick,
  Calendar
} from 'lucide-react';
import { useGetAdByIdQuery } from '@/redux/features/admin/adminAdsApi';
import { format } from 'date-fns';

interface AdDetailsModalProps {
  adId: string;
  onClose: () => void;
}

const AdDetailsModal: React.FC<AdDetailsModalProps> = ({ adId, onClose }) => {
  const { data: response, isLoading, isError } = useGetAdByIdQuery(adId);
  const ad = response?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Advertisement Details</h2>
            <p className="text-gray-400 text-sm mt-0.5">Comprehensive view of the ad performance and settings</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-gray-400">Fetching advertisement details...</p>
            </div>
          ) : isError || !ad ? (
            <div className="py-20 text-center">
              <p className="text-red-400">Failed to load advertisement details.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Banner Preview */}
              <div>
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">Banner Preview</p>
                <div className="relative group aspect-video rounded-xl overflow-hidden border border-gray-800 bg-black/40">
                  <img
                    src={ad.ad_image_url || 'https://via.placeholder.com/1200x400?text=No+Image'}
                    alt={ad.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x400?text=Image+Load+Error';
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Title</p>
                  <p className="text-white font-semibold">{ad.title}</p>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    ad.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {ad.status}
                  </span>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Total Clicks</p>
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-cyan-400" />
                    <p className="text-xl font-bold text-white">{ad.clicks.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Created At</p>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <p>{format(new Date(ad.created_at), 'PPP')}</p>
                  </div>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4 md:col-span-2">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Target Link</p>
                  <a 
                    href={ad.target_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors break-all"
                  >
                    {ad.target_link}
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetailsModal;
