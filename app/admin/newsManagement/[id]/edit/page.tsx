"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Save, 
  Send,
  Loader2,
  Type,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  useGetNewsArticleDetailsQuery, 
  useUpdateNewsArticleMutation, 
  useGetNewsCategoriesQuery 
} from '@/redux/features/admin/adminNewsApi';
import { toast } from 'react-hot-toast';

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  
  // Data Fetching
  const { data: articleData, isLoading: fetchLoading, error: fetchError } = useGetNewsArticleDetailsQuery(id as string);
  const { data: categoriesData } = useGetNewsCategoriesQuery();
  const [updateArticle, { isLoading: updateLoading }] = useUpdateNewsArticleMutation();
  
  const categories = categoriesData?.data || [];
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '' as string | number,
    excerpt: '',
    content: '',
    meta_title: '',
    meta_description: '',
    tags: '',
    status: 'DRAFT',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when data is loaded
  useEffect(() => {
    if (articleData?.success && articleData.data) {
      const article = articleData.data;
      setFormData({
        title: article.title || '',
        category: article.category || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
        status: (article as any).status || 'DRAFT',
      });
      setImagePreview(article.image_url || null);
    }
  }, [articleData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(articleData?.data?.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const dataToSend = new FormData();
      
      // Only append featured_image if a new file was selected
      if (imageFile) {
        dataToSend.append('featured_image', imageFile);
      }

      const payload = {
        ...formData,
        category: Number(formData.category),
        status
      };

      // Bundle the data as a JSON string
      dataToSend.append('data', JSON.stringify(payload));

      const response = await updateArticle({ id: id as string, data: dataToSend }).unwrap();
      
      if (response.success) {
        toast.success('Article updated successfully!');
        router.push('/admin/newsManagement');
      }
    } catch (error: any) {
      console.error('Failed to update article:', error);
      toast.error(error?.data?.message || 'Failed to update article');
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D2C] flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="text-cyan-400 animate-spin" />
        <p className="text-gray-400 font-bold animate-pulse">Loading Article Details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#0B0D2C] flex flex-col items-center justify-center gap-6 p-6">
        <div className="p-6 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 text-center max-w-md">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">Failed to Load Article</h2>
          <p className="text-gray-400 mb-6">We couldn't retrieve the article details. It might have been deleted or the API is unavailable.</p>
          <button 
            onClick={() => router.back()}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D2C] text-white">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-[#0B0D2C]/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black tracking-tight">Edit <span className="text-cyan-400">Article</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSubmit('DRAFT')}
              disabled={updateLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold transition-all border border-gray-800/50 disabled:opacity-50"
            >
              <Save size={18} />
              Save Draft
            </button>
            <button 
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={updateLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0B0D2C] rounded-xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {updateLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Update & Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 pb-24">
        <div className="space-y-10">
          
          {/* Featured Image Update */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <ImageIcon size={18} />
              </div>
              <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">Featured Image</h2>
            </div>
            
            <div 
              onClick={() => !imageFile && fileInputRef.current?.click()}
              className={`relative rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group overflow-hidden aspect-video flex flex-col items-center justify-center ${imagePreview 
                  ? 'border-transparent' 
                  : 'border-gray-800 hover:border-cyan-500/50 bg-[#171b2f]'
                }`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                    >
                      <Upload size={24} />
                    </button>
                    {imageFile && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/80 text-white backdrop-blur-md transition-all"
                      >
                        <X size={24} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-12">
                  <div className="w-16 h-16 rounded-3xl bg-cyan-500/5 flex items-center justify-center mx-auto mb-4 border border-cyan-500/10 group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-cyan-400" />
                  </div>
                  <p className="text-lg font-bold text-white mb-2">Change Article Banner</p>
                  <p className="text-sm text-gray-500">Click to upload a new image</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden" 
                accept="image/*"
              />
            </div>
          </section>

          {/* Core Content */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Type size={18} />
              </div>
              <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">Content Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block ml-1">Article Title</label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a catchy title..."
                  className="w-full bg-[#171b2f] border border-gray-800 focus:border-cyan-500/50 rounded-2xl p-4 text-lg font-bold transition-all outline-none placeholder:text-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block ml-1">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-[#171b2f] border border-gray-800 focus:border-cyan-500/50 rounded-2xl p-4 text-sm font-bold transition-all outline-none appearance-none cursor-pointer"
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block ml-1">Tags (Comma Separated)</label>
                  <input 
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="gear, football, youth..."
                    className="w-full bg-[#171b2f] border border-gray-800 focus:border-cyan-500/50 rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block ml-1">Excerpt (Short Summary)</label>
                <textarea 
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="A brief summary of your article..."
                  className="w-full bg-[#171b2f] border border-gray-800 focus:border-cyan-500/50 rounded-2xl p-4 text-sm font-medium transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block ml-1">Full Content (Markdown Supported)</label>
                <textarea 
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={15}
                  placeholder="Write your article content here..."
                  className="w-full bg-[#171b2f] border border-gray-800 focus:border-cyan-500/50 rounded-2xl p-6 text-base leading-relaxed font-medium transition-all outline-none min-h-[400px]"
                />
              </div>
            </div>
          </section>

          {/* SEO Metadata Card */}
          <section className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Search size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">SEO & Discovery</h2>
                <p className="text-sm text-gray-500 font-medium">Optimize how your article appears in search engines.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2 block">Meta Title</label>
                <input 
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  placeholder="Essential Gear for... | Caroline Atta"
                  className="w-full bg-black/20 border border-gray-800 focus:border-indigo-500/50 rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2 block">Meta Description</label>
                <textarea 
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="What users will see in Google results..."
                  className="w-full bg-black/20 border border-gray-800 focus:border-indigo-500/50 rounded-2xl p-4 text-sm font-medium transition-all outline-none resize-none"
                />
              </div>
            </div>
          </section>

          {/* Checklist Card */}
          <div className="bg-[#12142d] border border-gray-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${formData.title ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-600'}`}>
                <CheckCircle2 size={16} />
              </div>
              <span className="text-xs font-bold text-gray-400">Title Prefilled</span>

              <div className={`p-2 rounded-full ${formData.content.length > 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-600'}`}>
                <CheckCircle2 size={16} />
              </div>
              <span className="text-xs font-bold text-gray-400">Content Loaded</span>
            </div>

            <button
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={updateLoading}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0B0D2C] rounded-2xl font-black transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {updateLoading ? 'Updating...' : 'Update Article'}
              <ArrowLeft className="rotate-180" size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
