/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { 
  Eye, 
  Pencil, 
  Trash2, 
  ExternalLink,
  MousePointerClick,
  ImageIcon
} from 'lucide-react';
import { Ad } from '@/redux/features/admin/adminAdsApi';
import { format } from 'date-fns';

interface AdsTableProps {
  ads: Ad[];
  onView: (ad: Ad) => void;
  onEdit: (ad: Ad) => void;
  onDelete: (id: string, title: string) => void;
  isDeleting: boolean;
}

const AdsTable: React.FC<AdsTableProps> = ({ ads, onView, onEdit, onDelete, isDeleting }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0a0c16]/60 text-gray-400 border-b border-gray-800">
          <tr>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Ad Banner</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Title & Link</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Status</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Performance</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Date Created</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {ads.length > 0 ? ads.map((ad) => (
            <tr key={ad.ad_id} className="hover:bg-white/2 transition-colors group">
              <td className="px-6 py-4">
                <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-800 bg-black/20">
                  <img 
                    src={ad.ad_image_url || 'https://via.placeholder.com/80x48?text=No+Img'} 
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col max-w-[250px]">
                  <span className="text-gray-100 font-semibold truncate group-hover:text-cyan-400 transition-colors">{ad.title}</span>
                  <a 
                    href={ad.target_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-500 text-[11px] truncate hover:text-cyan-500/80 mt-0.5 flex items-center gap-1"
                  >
                    {ad.target_link} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  ad.status === 'ACTIVE' 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {ad.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="p-1.5 bg-cyan-500/10 rounded-md">
                    <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{ad.clicks.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-500">Total Clicks</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-400 text-xs">
                {format(new Date(ad.created_at), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onView(ad)}
                    className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => onEdit(ad)}
                    className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                    title="Edit Ad"
                  >
                    <Pencil className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => onDelete(ad.ad_id, ad.title)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                    title="Delete Ad"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-white/5 rounded-full">
                    <ImageIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">No advertisements found matching your criteria.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdsTable;
