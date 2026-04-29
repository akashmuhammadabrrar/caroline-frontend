"use client";

import React, { useState } from 'react';
import { 
  X, 
  Loader2, 
  Plus, 
  Save
} from 'lucide-react';
import { 
  useCreateFaqMutation, 
  useUpdateFaqMutation, 
  Faq 
} from '@/redux/features/admin/adminFaqApi';
import toast from 'react-hot-toast';

interface FaqModalProps {
  faq?: Faq | null;
  onClose: () => void;
}

const FaqFormModal: React.FC<FaqModalProps> = ({ faq, onClose }) => {
  const isEditing = !!faq;
  const [form, setForm] = useState({
    question: faq?.question || '',
    answer: faq?.answer || '',
    order: faq?.order || 1,
    is_active: faq ? faq.is_active : true,
  });

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateFaq({ id: faq.id, data: form }).unwrap();
        toast.success('FAQ updated successfully');
      } else {
        await createFaq(form).unwrap();
        toast.success('FAQ created successfully');
      }
      onClose();
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message || `Failed to ${isEditing ? 'update' : 'create'} FAQ`);
    }
  };

  const inputClass = "w-full bg-[#0a0c16] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit FAQ' : 'Create New FAQ'}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{isEditing ? 'Update the details of your FAQ' : 'Fill in the details to add a new question'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Question <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                placeholder="e.g. How do I register?" 
                value={form.question} 
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))} 
                className={inputClass} 
                required 
              />
            </div>

            <div>
              <label className={labelClass}>Answer <span className="text-red-400">*</span></label>
              <textarea 
                placeholder="Enter the answer here..." 
                value={form.answer} 
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} 
                className={`${inputClass} min-h-[120px] resize-none`} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  {isEditing ? 'Update FAQ' : 'Create FAQ'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FaqFormModal;
