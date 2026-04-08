"use client";

import React, { useState } from 'react';
import { 
  Newspaper, 
  Eye, 
  TrendingUp, 
  Tag as TagIcon, 
  Plus, 
  Pencil, 
  Trash2, 
  Layout,
  Search,
  Filter,
  ChevronDown,
  Monitor,
  Loader2
} from 'lucide-react';
import { 
  useGetNewsDashboardMetricsQuery, 
  useGetNewsArticlesQuery,
  useDeleteNewsArticleMutation
} from '@/redux/features/admin/adminNewsApi';
import {
  useGetNewsCategoriesQuery,
  useCreateNewsCategoryMutation,
  useUpdateNewsCategoryMutation,
  useDeleteNewsCategoryMutation,
  NewsCategory
} from '@/redux/features/admin/adminCategoriesApi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

// ─── Category Modal ──────────────────────────────────────────────────────────

interface CategoryModalProps {
  category?: NewsCategory | null;
  onClose: () => void;
}

function CategoryModal({ category, onClose }: CategoryModalProps) {
  const [createCategory, { isLoading: isCreating }] = useCreateNewsCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateNewsCategoryMutation();

  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    is_visible: category?.is_visible ?? true,
    is_featured: category?.is_featured ?? false,
    meta_title: category?.meta_title || '',
    meta_description: category?.meta_description || '',
    order: category?.order || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (category) {
        await updateCategory({ id: category.id, payload: formData }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory(formData).unwrap();
        toast.success('Category created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save category');
    }
  };

  const inputClass = "w-full bg-[#0a0c16] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all";
  const labelClass = "text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#171b2f] border border-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">{category ? 'Edit Category' : 'Add New Category'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Category Name</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Training Drills" className={inputClass} required />
            </div>
            
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Briefly describe what this category covers..." className={`${inputClass} h-24 resize-none`} required />
            </div>

            <div>
              <label className={labelClass}>Sort Order</label>
              <input name="order" type="number" value={formData.order} onChange={handleChange} className={inputClass} />
            </div>

            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="is_visible" checked={formData.is_visible} onChange={handleChange} className="w-4 h-4 rounded border-gray-800 bg-gray-900 text-cyan-500 focus:ring-cyan-500" />
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Visible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 rounded border-gray-800 bg-gray-900 text-cyan-500 focus:ring-cyan-500" />
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Featured</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">SEO Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Meta Title</label>
                <input name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="SEO Title" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} placeholder="SEO Description" className={`${inputClass} h-20 resize-none`} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 border border-gray-800 hover:bg-white/10 rounded-xl font-bold transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isCreating || isUpdating} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0B0D2C] rounded-xl font-bold transition-all disabled:opacity-50">
              {isCreating || isUpdating ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewsManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All Articles');

  const { data: metricsData, isLoading: isMetricsLoading } = useGetNewsDashboardMetricsQuery();
  const { data: articlesData, isLoading: isArticlesLoading } = useGetNewsArticlesQuery();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetNewsCategoriesQuery();
  
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteNewsArticleMutation();
  const [deleteCategory] = useDeleteNewsCategoryMutation();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const response = await deleteArticle(id).unwrap();
        if (response.success) {
          toast.success('Article deleted successfully');
        }
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to delete article');
      }
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"? This may affect articles using this category.`)) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Category deleted successfully');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to delete category');
      }
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const openEditModal = (cat: NewsCategory) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const metrics = [
    { 
      icon: <Newspaper className="w-5 h-5" />, 
      title: "Total Articles", 
      value: metricsData?.data?.total_articles?.toString() || "0", 
      sub: `${metricsData?.data?.published_this_month || 0} published this month`, 
      color: "text-blue-400", 
      bg: "bg-blue-500/10" 
    },
    { 
      icon: <Eye className="w-5 h-5" />, 
      title: "Total Views", 
      value: metricsData?.data?.total_views?.toLocaleString() || "0", 
      sub: "Total article reach", 
      color: "text-cyan-400", 
      bg: "bg-cyan-500/10" 
    },
    { 
      icon: <TagIcon className="w-5 h-5" />, 
      title: "Categories", 
      value: metricsData?.data?.active_categories?.toString() || "0", 
      sub: "Active categories", 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10" 
    },
    { 
      icon: <Monitor className="w-5 h-5" />, 
      title: "Published", 
      value: metricsData?.data?.published_count?.toString() || "0", 
      sub: `${metricsData?.data?.draft_count || 0} drafts currently`, 
      color: "text-purple-400", 
      bg: "bg-purple-500/10" 
    },
  ];

  const tabs = [
    { name: 'All Articles', count: metricsData?.data?.total_articles },
    { name: 'Published', count: metricsData?.data?.published_count },
    { name: 'Drafts', count: metricsData?.data?.draft_count },
    { name: 'Categories' }
  ];

  const articles = articlesData?.data || [];
  
  const filteredArticles = articles.filter(article => {
    if (activeTab === 'All Articles') return true;
    if (activeTab === 'Published') return article.status === 'PUBLISHED';
    if (activeTab === 'Drafts') return article.status === 'DRAFT';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0D2C] text-white p-6 md:p-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
            News Management
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Create and manage your platform's editorial content.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/newsManagement/create')}
          className="flex items-center gap-2 px-6 py-3 bg-[#00d8b6] hover:bg-[#00c2a3] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#00d8b6]/20 transform hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Create New Article
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[#171b2f] border border-gray-800 rounded-3xl p-6 transition-all hover:border-gray-700 hover:shadow-2xl">
            <div className={`inline-flex p-3 rounded-2xl ${m.bg} ${m.color} mb-4`}>
              {m.icon}
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{m.title}</p>
            <p className="text-3xl font-bold text-white mb-1">{m.value}</p>
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Navigation & Search */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-6">
        <div className="flex flex-wrap gap-8 border-b border-gray-800/50 w-full xl:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${
                activeTab === tab.name ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.name} {tab.count !== undefined && <span className="ml-1 opacity-60">({tab.count})</span>}
              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-cyan-400 to-purple-500" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative group flex-1 xl:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full bg-[#171b2f] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600"
            />
          </div>
          <button className="p-2.5 bg-[#171b2f] border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {isCategoryModalOpen && (
        <CategoryModal 
          category={editingCategory} 
          onClose={() => setIsCategoryModalOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      {activeTab === 'Categories' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isCategoriesLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Categories...</p>
            </div>
          ) : (
            <>
              {categoriesData?.data.map((cat, i) => {
                const colors = [
                  { icon: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { icon: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { icon: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { icon: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { icon: 'text-pink-400', bg: 'bg-pink-500/10' },
                  { icon: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                ];
                const color = colors[i % colors.length];

                return (
                  <div key={cat.id} className="group bg-[#171b2f] border border-gray-800 rounded-[2rem] p-8 hover:border-cyan-500/30 transition-all hover:shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${color.bg} ${color.icon}`}>
                          <TagIcon size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{cat.name}</h3>
                          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">{cat.article_count} articles</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(cat)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                      {cat.description}
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-800/50">
                        <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${cat.is_visible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visible</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${cat.is_featured ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-gray-600'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Featured</span>
                        </div>
                        <div className="ml-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Order: {cat.order}</span>
                        </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Add New Category Card */}
              <button 
                onClick={openAddModal}
                className="group border-2 border-dashed border-gray-800 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-gray-500 hover:text-cyan-400"
              >
                <div className="p-4 rounded-2xl bg-white/5 border border-gray-800 group-hover:border-cyan-500/30 transition-all">
                  <Plus size={32} />
                </div>
                <span className="text-lg font-black uppercase tracking-widest">Add New Category</span>
              </button>
            </>
          )}
        </div>
      ) : (
        /* Articles Table */
        <div className="bg-[#171b2f]/50 border border-gray-800 rounded-[2rem] overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#12142d]/50 border-b border-gray-800/50">
                  <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Article Title</th>
                  <th className="px-6 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-6 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Author</th>
                  <th className="px-6 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Views</th>
                  <th className="px-6 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {isArticlesLoading ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                        <p className="text-gray-400 font-medium">Loading articles...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center text-gray-500">
                      No articles found
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr 
                      key={article.id} 
                      className="group hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/newsManagement/${article.id}`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-800">
                            {article.image_url ? (
                              <img 
                                src={article.image_url} 
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Newspaper className="text-indigo-400" size={20} />
                            )}
                          </div>
                          <span className="font-bold text-white group-hover:text-cyan-400 transition-colors max-w-xs truncate">
                            {article.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-black tracking-widest uppercase">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-400">{article.author}</td>
                      <td className="px-6 py-6 text-sm text-gray-400">
                        {new Date(article.date_published).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-6 text-sm font-bold text-cyan-400">{(article.views ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          article.status === 'PUBLISHED' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {article.status ? (article.status.charAt(0) + article.status.slice(1).toLowerCase()) : 'Draft'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => router.push(`/admin/newsManagement/${article.id}`)}
                            className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 border border-blue-500/20"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => router.push(`/admin/newsManagement/${article.id}/edit`)}
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-110 border border-emerald-500/20"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(article.id, article.title)}
                            disabled={isDeleting}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 border border-red-500/20 disabled:opacity-50"
                          >
                            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
