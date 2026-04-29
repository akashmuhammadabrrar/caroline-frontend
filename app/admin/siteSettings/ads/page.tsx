"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Loader2, 
  Search, 
  Filter 
} from 'lucide-react';
import { 
  useGetAdsQuery, 
  useDeleteAdMutation,
  Ad
} from '@/redux/features/admin/adminAdsApi';
import toast from 'react-hot-toast';

// Sub-components
import AdFormModal from '@/components/adminDashboard/ads/AdFormModal';
import AdDetailsModal from '@/components/adminDashboard/ads/AdDetailsModal';
import AdsTable from '@/components/adminDashboard/ads/AdsTable';

export default function AdsManagementPage() {
  const { data: adsResp, isLoading, isError, refetch } = useGetAdsQuery();
  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdMutation();
  
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [detailAd, setDetailAd] = useState<Ad | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const ads = adsResp?.data || [];

  const filteredAds = ads.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.target_link.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the advertisement "${title}"?`)) {
      try {
        await deleteAd(id).unwrap();
        toast.success('Advertisement deleted successfully');
      } catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || 'Failed to delete advertisement');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111f] text-white p-6 md:p-8 font-sans">
      {/* Modals */}
      {(showAddModal || selectedAd) && (
        <AdFormModal 
          ad={selectedAd} 
          onClose={() => {
            setShowAddModal(false);
            setSelectedAd(null);
          }} 
        />
      )}
      
      {detailAd && (
        <AdDetailsModal 
          adId={detailAd.ad_id} 
          onClose={() => setDetailAd(null)} 
        />
      )}

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
              Advertisement Management
            </span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Create, monitor and manage your platform&apos;s ad campaigns</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00d8b6] text-white rounded-xl text-sm font-semibold hover:bg-[#00c2a3] transition-all hover:scale-105 shadow-lg shadow-[#00d8b6]/20 shrink-0"
        >
          <Plus className="w-5 h-5" /> Create New Ad
        </button>
      </header>

      {/* Toolbar */}
      <section className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search by title or link..."
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
            <p className="text-gray-400 animate-pulse">Loading advertisements...</p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <p className="text-red-400 mb-4">Failed to load advertisements.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">Retry</button>
          </div>
        ) : (
          <AdsTable 
            ads={filteredAds}
            onView={setDetailAd}
            onEdit={setSelectedAd}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </main>
    </div>
  );
}
