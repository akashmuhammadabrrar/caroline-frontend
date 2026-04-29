/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from 'react';
import { 
  X, 
  ImageIcon, 
  Loader2, 
  Plus, 
  Pencil 
} from 'lucide-react';
import { 
  useCreateAdMutation, 
  useUpdateAdMutation, 
  Ad 
} from '@/redux/features/admin/adminAdsApi';
import toast from 'react-hot-toast';

interface AdModalProps {
  ad?: Ad | null;
  onClose: () => void;
}

const AdFormModal: React.FC<AdModalProps> = ({ ad, onClose }) => {
  const isEditing = !!ad;
  const [form, setForm] = useState({
    title: ad?.title || '',
    link: ad?.target_link || '',
    status: ad?.status || 'ACTIVE',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(ad?.ad_image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createAd, { isLoading: isCreating }] = useCreateAdMutation();
  const [updateAd, { isLoading: isUpdating }] = useUpdateAdMutation();
  const isLoading = isCreating || isUpdating;

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

    const payload = {
      title: form.title,
      target_link: form.link,
      status: form.status,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    
    if (imageFile) {
      formData.append('abs_banner', imageFile);
    }

    try {
      if (isEditing) {
        await updateAd({ id: ad.ad_id, data: formData }).unwrap();
        toast.success('Advertisement updated successfully');
      } else {
        await createAd(formData).unwrap();
        toast.success('Advertisement created successfully');
      }
      onClose();
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message || `Failed to ${isEditing ? 'update' : 'create'} advertisement`);
    }
  };

  const inputClass = "w-full bg-[#0a0c16] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Advertisement' : 'Create New Advertisement'}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{isEditing ? 'Update the details of your advertisement' : 'Fill in the details to launch a new ad campaign'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className={labelClass}>Ad Banner <span className="text-gray-500 text-xs">(image upload)</span></label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-colors"
            >
              {imagePreview ? (
                <div className="relative group">
                  <img src={imagePreview} alt="Ad preview" className="w-full max-h-48 object-contain bg-black/20" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-white text-sm font-medium">Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500">
                  <ImageIcon className="w-10 h-10" />
                  <p className="text-sm">Click to upload ad banner</p>
                  <p className="text-xs text-gray-600">Recommended: 1200x400 or similar aspect ratio</p>
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
                placeholder="e.g. Summer Sale 2024" 
                value={form.title} 
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                className={inputClass} 
                required 
              />
            </div>

            <div>
              <label className={labelClass}>Target Link <span className="text-red-400">*</span></label>
              <input 
                type="url" 
                placeholder="https://example.com/promo" 
                value={form.link} 
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))} 
                className={inputClass} 
                required 
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))} 
                className={inputClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 bg-[#0a0c16] border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 py-2.5 bg-[#00d8b6] text-white rounded-lg text-sm font-medium hover:bg-[#00c2a3] transition-colors shadow-lg shadow-[#00d8b6]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  {isEditing ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isEditing ? 'Update Advertisement' : 'Create Advertisement'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdFormModal;
