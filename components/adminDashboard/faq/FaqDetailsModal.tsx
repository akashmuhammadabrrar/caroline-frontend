"use client";

import React from 'react';
import { 
  X, 
  Loader2, 
  Calendar,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useGetFaqByIdQuery } from '@/redux/features/admin/adminFaqApi';
import { format } from 'date-fns';

interface FaqDetailsModalProps {
  faqId: number | string;
  onClose: () => void;
}

const FaqDetailsModal: React.FC<FaqDetailsModalProps> = ({ faqId, onClose }) => {
  const { data: response, isLoading, isError } = useGetFaqByIdQuery(faqId);
  const faq = response?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">FAQ Details</h2>
            <p className="text-gray-400 text-sm mt-0.5">Full view of the FAQ content and settings</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-gray-400">Fetching FAQ details...</p>
            </div>
          ) : isError || !faq ? (
            <div className="py-20 text-center">
              <p className="text-red-400">Failed to load FAQ details.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#0a0c16] border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">Question</p>
                <p className="text-white text-lg font-bold">{faq.question}</p>
              </div>

              <div className="bg-[#0a0c16] border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">Answer</p>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{faq.answer}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {faq.is_active ? (
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
                    <p className="text-lg font-bold">{faq.order}</p>
                  </div>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Created At</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-300">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <p>{format(new Date(faq.created_at), 'PPP')}</p>
                  </div>
                </div>
                <div className="bg-[#0a0c16] border border-gray-800 rounded-xl px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Last Updated</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-300">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <p>{format(new Date(faq.updated_at), 'PPP')}</p>
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

export default FaqDetailsModal;
