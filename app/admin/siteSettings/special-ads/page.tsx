"use client";

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  ImageIcon, 
  ExternalLink, 
  MousePointerClick, 
  LayoutGrid,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetAdminSpecialAdsQuery, 
  useCreateSpecialAdMutation, 
  useUpdateSpecialAdMutation, 
  useDeleteSpecialAdMutation,
  SpecialAd
} from '@/redux/features/ads/specialAdsApi';

// ─── Create/Edit Ad Modal ──────────────────────────────────────────────────

interface AdModalProps {
  ad?: SpecialAd;
  onClose: () => void;
}

function AdModal({ ad, onClose }: AdModalProps) {
  const isEditing = !!ad;
  const [title, setTitle] = useState(ad?.title || '');
  const [targetLink, setTargetLink] = useState(ad?.target_link || '');
  const [position, setPosition] = useState<"TOP" | "BOTTOM">(ad?.position || 'TOP');
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(ad?.status || 'ACTIVE');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(ad?.special_ad_image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createAd, { isLoading: isCreating }] = useCreateSpecialAdMutation();
  const [updateAd, { isLoading: isUpdating }] = useUpdateSpecialAdMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !imageFile) {
      toast.error('Please upload an advertisement image');
      return;
    }

    try {
      const formData = new FormData();
      if (imageFile) {
        // Trying multiple possible keys for the image
        formData.append('special_ads', imageFile);
        formData.append('special_ad_image', imageFile);
      }
      
      // Send fields at top level
      formData.append('title', title);
      formData.append('status', status);
      formData.append('position', position);
      formData.append('target_link', targetLink);
      formData.append('link', targetLink);

      // Also send them as a JSON 'data' field (some endpoints in this project use this)
      const jsonPayload = {
        title,
        status,
        position,
        target_link: targetLink,
        link: targetLink
      };
      formData.append('data', JSON.stringify(jsonPayload));

      if (isEditing) {
        await updateAd({ id: ad.ad_id, data: formData }).unwrap();
        toast.success('Advertisement updated successfully');
      } else {
        await createAd(formData).unwrap();
        toast.success('Advertisement created successfully');
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; errors?: Record<string, string[]> } };
      // Improved error display to show specific field errors if available
      if (error?.data?.errors) {
        const errorMessages = Object.entries(error.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
        toast.error(errorMessages);
      } else {
        toast.error(error?.data?.message || 'Something went wrong');
      }
    }
  };

  const inputClass = "w-full bg-[#0a0c16] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit' : 'Create'} Special Ad</h2>
            <p className="text-gray-400 text-sm mt-0.5">Manage your landing page advertisement</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className={labelClass}>Ad Image {!isEditing && <span className="text-red-400">*</span>}</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-colors bg-[#0a0c16]"
            >
              {imagePreview ? (
                <div className="relative aspect-[16/5] w-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-white text-sm font-medium">Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500">
                  <ImageIcon className="w-8 h-8" />
                  <p className="text-sm font-medium">Click to upload ad image</p>
                  <p className="text-xs text-gray-600">Recommended: 1200x200 or similar aspect ratio</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Ad Title <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                placeholder="Enter ad title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className={inputClass} 
                required 
              />
            </div>

            <div>
              <label className={labelClass}>Target Link <span className="text-red-400">*</span></label>
              <input 
                type="url" 
                placeholder="https://example.com" 
                value={targetLink} 
                onChange={e => setTargetLink(e.target.value)} 
                className={inputClass} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Position</label>
                <select 
                  value={position} 
                  onChange={e => setPosition(e.target.value as "TOP" | "BOTTOM")} 
                  className={inputClass}
                >
                  <option value="TOP">Top</option>
                  <option value="BOTTOM">Bottom</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value as "ACTIVE" | "INACTIVE")} 
                  className={inputClass}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 bg-transparent border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isCreating || isUpdating} 
              className="flex-1 py-2.5 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {(isCreating || isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isEditing ? 'Update Ad' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────

function DeleteModal({ title, onConfirm, onClose, isDeleting }: { 
  title: string; onConfirm: () => void; onClose: () => void; isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Delete Advertisement?</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">&quot;{title}&quot;</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 bg-transparent border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Special Ads Page ────────────────────────────────────────────────

export default function SpecialAdsPage() {
  const { data, isLoading } = useGetAdminSpecialAdsQuery();
  const [deleteAd, { isLoading: isDeleting }] = useDeleteSpecialAdMutation();
  const [selectedAd, setSelectedAd] = useState<SpecialAd | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const [adToDelete, setAdToDelete] = useState<SpecialAd | null>(null);

  const ads = data?.data || [];

  const handleDeleteConfirm = async () => {
    if (!adToDelete) return;
    try {
      await deleteAd(adToDelete.ad_id).unwrap();
      toast.success('Advertisement deleted');
      setAdToDelete(null);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = (ad: SpecialAd) => {
    setSelectedAd(ad);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedAd(undefined);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0f111f] text-white p-6 md:p-10 font-sans">
      {showModal && (
        <AdModal 
          ad={selectedAd} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {adToDelete && (
        <DeleteModal 
          title={adToDelete.title}
          onConfirm={handleDeleteConfirm}
          onClose={() => setAdToDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-cyan-400" />
            Special Ads <span className="text-cyan-400">Management</span>
          </h1>
          <p className="text-gray-400 mt-2">Create and manage premium advertisements for the landing page</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Ad
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#171b2f] border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Active Ads</span>
          </div>
          <p className="text-3xl font-bold">{ads.filter(a => a.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-[#171b2f] border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <MousePointerClick className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Total Clicks</span>
          </div>
          <p className="text-3xl font-bold">{ads.reduce((acc, curr) => acc + (curr.clicks || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#171b2f] border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Inactive Ads</span>
          </div>
          <p className="text-3xl font-bold">{ads.filter(a => a.status === 'INACTIVE').length}</p>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#0a0c16]/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Preview</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Loading advertisements...</p>
                  </td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="bg-gray-800/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 font-medium">No ads found</p>
                    <button onClick={handleCreate} className="mt-4 text-cyan-400 hover:underline text-sm">Create your first ad</button>
                  </td>
                </tr>
              ) : ads.map((ad) => (
                <tr key={ad.ad_id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-40 h-14 rounded-lg overflow-hidden border border-gray-800 bg-[#0a0c16]">
                      <img 
                        src={ad.special_ad_image_url} 
                        alt={ad.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors">{ad.title}</span>
                      <a 
                        href={ad.target_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 text-xs flex items-center gap-1 hover:text-gray-300 mt-1"
                      >
                        {ad.target_link}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                      ad.position === 'TOP' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-pink-500/10 text-pink-400'
                    }`}>
                      {ad.position}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <MousePointerClick className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-bold">{ad.clicks || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${ad.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <span className={`text-xs font-medium ${ad.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-500'}`}>
                        {ad.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(ad)}
                        className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => setAdToDelete(ad)}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
