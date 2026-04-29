/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from 'react';
import { 
  X, 
  ImageIcon, 
  Loader2, 
  Plus, 
  Save,
  Star
} from 'lucide-react';
import { 
  useCreateTestimonialMutation, 
  useUpdateTestimonialMutation, 
  Testimonial 
} from '@/redux/features/admin/adminTestimonialApi';
import toast from 'react-hot-toast';

interface TestimonialModalProps {
  testimonial?: Testimonial | null;
  onClose: () => void;
}

const TestimonialFormModal: React.FC<TestimonialModalProps> = ({ testimonial, onClose }) => {
  const isEditing = !!testimonial;
  const [form, setForm] = useState({
    name: testimonial?.name || '',
    rating: testimonial?.rating || 5,
    comment: testimonial?.comment || '',
    order: testimonial?.order || 1,
    is_active: testimonial ? testimonial.is_active : true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(testimonial?.image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createTestimonial, { isLoading: isCreating }] = useCreateTestimonialMutation();
  const [updateTestimonial, { isLoading: isUpdating }] = useUpdateTestimonialMutation();
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
      toast.error('Please upload a profile image');
      return;
    }

    const payload = {
      name: form.name,
      rating: form.rating,
      comment: form.comment,
      order: form.order,
      is_active: form.is_active,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (isEditing) {
        await updateTestimonial({ id: testimonial.id, data: formData }).unwrap();
        toast.success('Testimonial updated successfully');
      } else {
        await createTestimonial(formData).unwrap();
        toast.success('Testimonial created successfully');
      }
      onClose();
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message || `Failed to ${isEditing ? 'update' : 'create'} testimonial`);
    }
  };

  const inputClass = "w-full bg-[#0a0c16] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Testimonial' : 'Create New Testimonial'}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{isEditing ? 'Update the details of the testimonial' : 'Add a new client testimonial to the platform'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full border-2 border-dashed border-gray-700 overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-colors bg-[#0a0c16] flex items-center justify-center relative group"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-[10px] text-white font-bold">Change</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-600">
                  <ImageIcon className="w-8 h-8" />
                  <p className="text-[10px] mt-1">Upload</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">Client Profile Photo</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Client Name <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                placeholder="e.g. John Smith" 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                className={inputClass} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rating (1-5)</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <select 
                    value={form.rating} 
                    onChange={e => setForm(f => ({ ...f, rating: parseInt(e.target.value) }))} 
                    className={`${inputClass} pl-10`}
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} Stars</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Display Order</label>
                <input 
                  type="number" 
                  value={form.order} 
                  onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) }))} 
                  className={inputClass} 
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Comment <span className="text-red-400">*</span></label>
              <textarea 
                placeholder="Client's feedback..." 
                value={form.comment} 
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} 
                className={`${inputClass} min-h-[100px] resize-none`} 
                required 
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select 
                value={form.is_active ? 'true' : 'false'} 
                onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} 
                className={inputClass}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
                  {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isEditing ? 'Update Testimonial' : 'Create Testimonial'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialFormModal;
