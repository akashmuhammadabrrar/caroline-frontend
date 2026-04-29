/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Star,
  Layers,
  MessageSquareQuote
} from 'lucide-react';
import { Testimonial } from '@/redux/features/admin/adminTestimonialApi';
import { format } from 'date-fns';

interface TestimonialTableProps {
  testimonials: Testimonial[];
  onView: (t: Testimonial) => void;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: number, name: string) => void;
  isDeleting: boolean;
}

const TestimonialTable: React.FC<TestimonialTableProps> = ({ testimonials, onView, onEdit, onDelete, isDeleting }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0a0c16]/60 text-gray-400 border-b border-gray-800">
          <tr>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Client</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Comment</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Rating</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Status</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Date Created</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {testimonials.length > 0 ? testimonials.map((t) => (
            <tr key={t.id} className="hover:bg-white/2 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-800 bg-black/20">
                    <img 
                      src={t.image_url || 'https://via.placeholder.com/40'} 
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-100 font-semibold truncate group-hover:text-cyan-400 transition-colors">{t.name}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Order: {t.order}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-gray-500 text-[11px] truncate max-w-[250px] italic">
                  &quot;{t.comment}&quot;
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} 
                    />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  t.is_active 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400 text-xs">
                {format(new Date(t.created_at), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onView(t)}
                    className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => onEdit(t)}
                    className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                    title="Edit Testimonial"
                  >
                    <Pencil className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => onDelete(t.id, t.name)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                    title="Delete Testimonial"
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
                    <MessageSquareQuote className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">No testimonials found matching your criteria.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TestimonialTable;
