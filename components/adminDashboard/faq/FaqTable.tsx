"use client";

import React from 'react';
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { Faq } from '@/redux/features/admin/adminFaqApi';
import { format } from 'date-fns';

interface FaqTableProps {
  faqs: Faq[];
  onView: (faq: Faq) => void;
  onEdit: (faq: Faq) => void;
  onDelete: (id: number, question: string) => void;
  isDeleting: boolean;
}

const FaqTable: React.FC<FaqTableProps> = ({ faqs, onView, onEdit, onDelete, isDeleting }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0a0c16]/60 text-gray-400 border-b border-gray-800">
          <tr>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Question</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Display Order</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Status</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px]">Date Created</th>
            <th className="px-6 py-5 font-medium uppercase tracking-wider text-[11px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {faqs.length > 0 ? faqs.map((faq) => (
            <tr key={faq.id} className="hover:bg-white/2 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex flex-col max-w-[400px]">
                  <span className="text-gray-100 font-semibold truncate group-hover:text-cyan-400 transition-colors">{faq.question}</span>
                  <span className="text-gray-500 text-[11px] truncate mt-0.5">{faq.answer}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="p-1.5 bg-cyan-500/10 rounded-md">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="font-bold text-white">{faq.order}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  faq.is_active 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {faq.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400 text-xs">
                {format(new Date(faq.created_at), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onView(faq)}
                    className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => onEdit(faq)}
                    className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                    title="Edit FAQ"
                  >
                    <Pencil className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => onDelete(faq.id, faq.question)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-white/5 rounded-full">
                    <HelpCircle className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">No FAQs found matching your criteria.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FaqTable;
