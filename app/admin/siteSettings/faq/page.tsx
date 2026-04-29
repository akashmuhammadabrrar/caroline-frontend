"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Loader2, 
  Search, 
  Filter 
} from 'lucide-react';
import { 
  useGetFaqsQuery, 
  useDeleteFaqMutation,
  Faq
} from '@/redux/features/admin/adminFaqApi';
import toast from 'react-hot-toast';

// Sub-components
import FaqFormModal from '@/components/adminDashboard/faq/FaqFormModal';
import FaqDetailsModal from '@/components/adminDashboard/faq/FaqDetailsModal';
import FaqTable from '@/components/adminDashboard/faq/FaqTable';

export default function FaqManagementPage() {
  const { data: faqsResp, isLoading, isError, refetch } = useGetFaqsQuery();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();
  
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [detailFaq, setDetailFaq] = useState<Faq | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = faqsResp?.data || [];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number, question: string) => {
    if (window.confirm(`Are you sure you want to delete the FAQ "${question}"?`)) {
      try {
        await deleteFaq(id).unwrap();
        toast.success('FAQ deleted successfully');
      } catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || 'Failed to delete FAQ');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111f] text-white p-6 md:p-8 font-sans">
      {/* Modals */}
      {(showAddModal || selectedFaq) && (
        <FaqFormModal 
          faq={selectedFaq} 
          onClose={() => {
            setShowAddModal(false);
            setSelectedFaq(null);
          }} 
        />
      )}
      
      {detailFaq && (
        <FaqDetailsModal 
          faqId={detailFaq.id} 
          onClose={() => setDetailFaq(null)} 
        />
      )}

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
              FAQ Management
            </span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Manage frequently asked questions to help your platform users</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00d8b6] text-white rounded-xl text-sm font-semibold hover:bg-[#00c2a3] transition-all hover:scale-105 shadow-lg shadow-[#00d8b6]/20 shrink-0"
        >
          <Plus className="w-5 h-5" /> Create New FAQ
        </button>
      </header>

      {/* Toolbar */}
      <section className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search by question or answer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#171b2f] border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-[#171b2f] border border-gray-800 rounded-xl text-sm text-gray-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </section>

      {/* Main Content */}
      <main className="bg-[#171b2f] border border-gray-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            <p className="text-gray-400 animate-pulse">Loading FAQs...</p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <p className="text-red-400 mb-4">Failed to load FAQs.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">Retry</button>
          </div>
        ) : (
          <FaqTable 
            faqs={filteredFaqs}
            onView={setDetailFaq}
            onEdit={setSelectedFaq}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </main>
    </div>
  );
}
