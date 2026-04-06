"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Settings, Image as ImageIcon, Type, Sparkles, X, Check, Save, Palette, Plus, Edit2, Trash2, ArrowLeft, LayoutTemplate, Users, UserPlus, Flag } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
  GeneralSettings,
  useGetFooterContentQuery,
  useCreateFooterContentMutation,
  useUpdateFooterContentMutation,
  useDeleteFooterContentMutation,
  FooterContent,
  FooterLink,
  useGetFeaturedPlayersQuery,
  useCreateFeaturedPlayerMutation,
  useUpdateFeaturedPlayerMutation,
  useDeleteFeaturedPlayerMutation,
  FeaturedPlayer
} from "@/redux/features/admin/adminSettingsApi";

const cardClass = "bg-[#171b2f] border border-gray-800 rounded-[2rem] p-8 md:p-10 mb-8 shadow-2xl backdrop-blur-sm";
const sectionTitleClass = "text-xl font-bold text-white mb-8 flex items-center gap-3";
const labelClass = "text-sm font-medium text-gray-400 mb-2.5 block ml-1";
const inputClass = "w-full bg-[#0a0c16] border border-gray-800 rounded-xl px-4 py-4 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600";

const FooterContentForm = ({ initialData, onBack }: { initialData?: Partial<FooterContent>, onBack: () => void }) => {
  const [createFooter, { isLoading: isCreating }] = useCreateFooterContentMutation();
  const [updateFooter, { isLoading: isUpdating }] = useUpdateFooterContentMutation();

  const [formData, setFormData] = useState<Partial<FooterContent>>({
    about_text: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    copyright_text: '',
    background_color: '#080D2C',
    text_color: '#FFFFFF',
    is_active: true,
    links: [],
    ...initialData
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (index: number, field: string, value: string | number | boolean) => {
    setFormData(prev => {
      const newLinks = [...(prev.links || [])];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, links: newLinks };
    });
  };

  const handleAddLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...(prev.links || []), { category: 'PLATFORM', link_text: '', link_url: '', order: (prev.links?.length || 0) + 1, is_active: true }]
    }));
  };

  const handleRemoveLink = (index: number) => {
    setFormData(prev => {
      const newLinks = [...(prev.links || [])];
      newLinks.splice(index, 1);
      return { ...prev, links: newLinks };
    });
  };

  const handleSave = async () => {
    try {
      if (formData.id) {
        await updateFooter({ id: formData.id, data: formData }).unwrap();
        toast.success("Footer content updated successfully");
      } else {
        await createFooter(formData).unwrap();
        toast.success("Footer content created successfully");
      }
      onBack();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save footer content");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/5 border border-gray-800 rounded-xl hover:bg-white/10 hover:text-cyan-400 transition-all text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">
              {formData.id ? 'Edit Footer Variant' : 'Create New Footer'}
            </h1>
            <p className="text-gray-500 text-sm">Fill out the details for your platform's footer layout</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00cce6] text-[#080D2C] font-bold transition-all shadow-lg shadow-[#00E5FF]/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Save Footer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cardClass}>
          <h2 className={sectionTitleClass}><Type size={20} className="text-cyan-400" /> Text & General</h2>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>About Text</label>
              <textarea
                name="about_text"
                value={formData.about_text || ''}
                onChange={handleChange}
                className={inputClass + " min-h-[120px]"}
                placeholder="Brief description about the platform..."
              />
            </div>
            <div>
              <label className={labelClass}>Copyright Text</label>
              <input
                name="copyright_text"
                value={formData.copyright_text || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. © 2026 NextGen Pros..."
              />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={sectionTitleClass}><Palette size={20} className="text-purple-400" /> Styling</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Background Color</label>
              <div className="flex items-center gap-3 bg-[#0a0c16] border border-gray-800 rounded-xl p-2 pr-4 transition-all focus-within:border-cyan-500/50">
                <input
                  type="color"
                  value={formData.background_color || '#080D2C'}
                  onChange={(e) => setFormData(p => ({ ...p, background_color: e.target.value }))}
                  className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.background_color || '#080D2C'}
                  onChange={(e) => setFormData(p => ({ ...p, background_color: e.target.value }))}
                  className="bg-transparent border-none focus:outline-none text-white font-mono uppercase text-sm w-full"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Text Color</label>
              <div className="flex items-center gap-3 bg-[#0a0c16] border border-gray-800 rounded-xl p-2 pr-4 transition-all focus-within:border-cyan-500/50">
                <input
                  type="color"
                  value={formData.text_color || '#FFFFFF'}
                  onChange={(e) => setFormData(p => ({ ...p, text_color: e.target.value }))}
                  className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.text_color || '#FFFFFF'}
                  onChange={(e) => setFormData(p => ({ ...p, text_color: e.target.value }))}
                  className="bg-transparent border-none focus:outline-none text-white font-mono uppercase text-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}><Sparkles size={20} className="text-amber-400" /> Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url'].map(social => (
            <div key={social}>
              <label className={labelClass}>{social.replace('_url', '').charAt(0).toUpperCase() + social.replace('_url', '').slice(1)} URL</label>
              <input
                name={social}
                value={(formData as any)[social] || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder={`https://${social.replace('_url', '')}.com/...`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex justify-between items-center mb-8">
          <h2 className={sectionTitleClass} style={{ marginBottom: 0 }}>Navigation Links</h2>
          <button onClick={handleAddLink} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 font-bold text-sm transition-all flex items-center gap-1"><Plus size={16} /> Add Link</button>
        </div>

        <div className="space-y-4">
          {formData.links && formData.links.length > 0 ? (
            formData.links.map((link, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-[#0a0c16] rounded-xl border border-gray-800 items-start md:items-center relative group">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                  <select
                    value={link.category}
                    onChange={e => handleLinkChange(index, 'category', e.target.value)}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 text-sm appearance-none cursor-pointer"
                  >
                    <option value="PLATFORM">PLATFORM</option>
                    <option value="RESOURCES">RESOURCES</option>
                    <option value="SUPPORT">SUPPORT</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Label</label>
                  <input
                    type="text"
                    value={link.link_text}
                    onChange={e => handleLinkChange(index, 'link_text', e.target.value)}
                    className="w-full bg-transparent border-none text-white focus:outline-none placeholder:text-gray-600 text-sm"
                    placeholder="e.g. Home"
                  />
                </div>
                <div className="flex-1 w-full md:w-auto md:max-w-[200px]">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">URL Route</label>
                  <input
                    type="text"
                    value={link.link_url}
                    onChange={e => handleLinkChange(index, 'link_url', e.target.value)}
                    className="w-full bg-transparent border-none text-cyan-400 focus:outline-none placeholder:text-gray-600 text-sm font-mono"
                    placeholder="e.g. /"
                  />
                </div>
                <div className="w-16">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Order</label>
                  <input
                    type="number"
                    value={link.order}
                    onChange={e => handleLinkChange(index, 'order', parseInt(e.target.value))}
                    className="w-full bg-transparent border-none text-white focus:outline-none placeholder:text-gray-600 text-sm"
                  />
                </div>
                <button
                  onClick={() => handleRemoveLink(index)}
                  className="md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border border-gray-800 border-dashed rounded-xl">
              <p className="text-gray-500">No links added yet. Click &quot;Add Link&quot; to start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FooterCardsTab = () => {
  const { data: footerResponse, isLoading } = useGetFooterContentQuery();
  const [deleteFooter, { isLoading: isDeleting }] = useDeleteFooterContentMutation();
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedFooter, setSelectedFooter] = useState<Partial<FooterContent> | undefined>(undefined);

  const footers = Array.isArray(footerResponse?.data)
    ? footerResponse.data
    : footerResponse?.data
      ? [footerResponse.data]
      : [];

  const handleEdit = (footer: FooterContent) => {
    setSelectedFooter(footer);
    setViewState('edit');
  };

  const handleCreate = () => {
    setSelectedFooter(undefined);
    setViewState('create');
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this footer card?")) {
      try {
        await deleteFooter(id).unwrap();
        toast.success("Footer deleted successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete footer");
      }
    }
  };

  if (viewState === 'create' || viewState === 'edit') {
    return <FooterContentForm initialData={selectedFooter} onBack={() => setViewState('list')} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
            Footer Cards
          </h1>
          <p className="text-gray-500 text-lg">Manage all footer layout variants across your platform</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-[#00E5FF] font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create New Footer
        </button>
      </div>

      {footers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#171b2f] border border-gray-800 border-dashed rounded-[2rem]">
          <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-full flex justify-center items-center mb-4">
            <LayoutTemplate size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">No Footer Cards Found</h3>
          <p className="text-gray-500 mb-6 text-center max-w-sm">Create different footer templates and styles to use across your platform.</p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00cce6] text-[#080D2C] font-bold transition-all"
          >
            Create Your First Footer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {footers.map((footer) => (
            <div key={footer.id} className="bg-[#171b2f] border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all flex flex-col group relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-2 opacity-80 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                style={{ backgroundColor: footer.background_color || '#00E5FF' }}
              />
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Footer Variant #{footer.id}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${footer.is_active ? 'bg-[#00E5FF] shadow-[#00E5FF]/80' : 'bg-gray-500'}`} />
                    <span className="text-xs text-gray-400">{footer.is_active ? 'Active' : 'Draft'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(footer)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors"
                    title="Edit Footer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(footer.id)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                    title="Delete Footer"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                {footer.about_text || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between border-t border-gray-800/50 pt-4">
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-md border border-gray-700 shadow-sm" style={{ backgroundColor: footer.background_color }} title="Background" />
                  <div className="w-6 h-6 rounded-md border border-gray-700 shadow-sm flex items-center justify-center font-bold text-[10px]" style={{ backgroundColor: '#171b2f', color: footer.text_color }} title="Text Color">T</div>
                </div>
                <div className="text-xs font-mono font-bold text-gray-500 bg-[#0a0c16] px-3 py-1 rounded-full border border-gray-800">
                  {footer.links?.length || 0} Links
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FeaturedPlayerForm = ({ initialData, onBack }: { initialData?: Partial<FeaturedPlayer>, onBack: () => void }) => {
  const [createPlayer, { isLoading: isCreating }] = useCreateFeaturedPlayerMutation();
  const [updatePlayer, { isLoading: isUpdating }] = useUpdateFeaturedPlayerMutation();

  const [formData, setFormData] = useState<Partial<FeaturedPlayer>>({
    player_name: '',
    country_name: '',
    position: '',
    order: 1,
    is_active: true,
    ...initialData
  });

  const [flagImagePreview, setFlagImagePreview] = useState<string | null>(
    typeof initialData?.flag_image === 'string' ? initialData.flag_image : null
  );
  const [playerImagePreview, setPlayerImagePreview] = useState<string | null>(
    typeof initialData?.player_image === 'string' ? initialData.player_image : null
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'flag_image' | 'player_image') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'flag_image') setFlagImagePreview(reader.result as string);
        else setPlayerImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const payload = new FormData();

      const data = {
        player_name: formData.player_name || '',
        country_name: formData.country_name || '',
        position: formData.position || '',
        order: Number(formData.order) || 1,
        is_active: !!formData.is_active
      };

      payload.append('data', JSON.stringify(data));

      if (formData.flag_image instanceof File) {
        payload.append('flag_image', formData.flag_image);
      }
      if (formData.player_image instanceof File) {
        payload.append('player_image', formData.player_image);
      }

      if (formData.id) {
        await updatePlayer({ id: formData.id, data: payload }).unwrap();
        toast.success("Featured player updated successfully");
      } else {
        await createPlayer(payload).unwrap();
        toast.success("Featured player created successfully");
      }
      onBack();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save player");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/5 border border-gray-800 rounded-xl hover:bg-white/10 hover:text-cyan-400 transition-all text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">
              {formData.id ? 'Edit Player' : 'Create New Player'}
            </h1>
            <p className="text-gray-500 text-sm">Add or modify featured player details</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00cce6] text-[#080D2C] font-bold transition-all shadow-lg shadow-[#00E5FF]/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Save Player
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cardClass}>
          <h2 className={sectionTitleClass}><Type size={20} className="text-cyan-400" /> Player Details</h2>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Player Name</label>
              <input name="player_name" value={formData.player_name || ''} onChange={handleChange} className={inputClass} placeholder="Lionel Messi" />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input name="country_name" value={formData.country_name || ''} onChange={handleChange} className={inputClass} placeholder="Argentina" />
            </div>
            <div>
              <label className={labelClass}>Position</label>
              <input name="position" value={formData.position || ''} onChange={handleChange} className={inputClass} placeholder="Forward" />
            </div>
            <div className="flex gap-6">
              <div className="flex-1">
                <label className={labelClass}>Order</label>
                <input name="order" type="number" value={formData.order || 1} onChange={handleChange} className={inputClass} />
              </div>
              <div className="flex-1 flex flex-col justify-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={!!formData.is_active} onChange={handleChange} className="w-5 h-5 rounded border-gray-800 bg-[#0a0c16] text-cyan-400 focus:ring-cyan-500/50" />
                  <span className="text-sm font-medium text-gray-400">Is Active</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={sectionTitleClass}><ImageIcon size={20} className="text-purple-400" /> Images</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-1">
                <label className={labelClass}>Flag Image</label>
                <div className="relative group mt-2">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "flag_image")} className="hidden" id="flag-upload" />
                  <label htmlFor="flag-upload" className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-800 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group-hover:bg-[#0a0c16]">
                    <div className="flex flex-col items-center gap-1">
                      <Flag className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[10px] text-gray-500 text-center px-2 line-clamp-1">{formData.flag_image instanceof File ? formData.flag_image.name : "Upload Flag"}</span>
                    </div>
                  </label>
                </div>
                {flagImagePreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-800 bg-[#0a0c16] h-16 w-full relative flex items-center justify-center p-2">
                    <Image src={flagImagePreview} alt="Flag" fill className="object-contain" unoptimized />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className={labelClass}>Player Avatar</label>
                <div className="relative group mt-2">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "player_image")} className="hidden" id="avatar-upload" />
                  <label htmlFor="avatar-upload" className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-800 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group-hover:bg-[#0a0c16]">
                    <div className="flex flex-col items-center gap-1">
                      <UserPlus className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[10px] text-gray-500 text-center px-2 line-clamp-1">{formData.player_image instanceof File ? formData.player_image.name : "Upload Avatar"}</span>
                    </div>
                  </label>
                </div>
                {playerImagePreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-800 bg-[#0a0c16] h-16 w-full relative flex items-center justify-center p-2">
                    <Image src={playerImagePreview} alt="Avatar" fill className="object-contain" unoptimized />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedPlayersTab = () => {
  const { data: playersResponse, isLoading } = useGetFeaturedPlayersQuery();
  const [deletePlayer, { isLoading: isDeleting }] = useDeleteFeaturedPlayerMutation();
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPlayer, setSelectedPlayer] = useState<Partial<FeaturedPlayer> | undefined>(undefined);

  const players = Array.isArray(playersResponse?.data) ? playersResponse.data : [];

  const handleEdit = (player: FeaturedPlayer) => {
    setSelectedPlayer(player);
    setViewState('edit');
  };

  const handleCreate = () => {
    setSelectedPlayer(undefined);
    setViewState('create');
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this featured player?")) {
      try {
        await deletePlayer(id).unwrap();
        toast.success("Player removed successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete player");
      }
    }
  };

  if (viewState === 'create' || viewState === 'edit') {
    return <FeaturedPlayerForm initialData={selectedPlayer} onBack={() => setViewState('list')} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
            Featured Players
          </h1>
          <p className="text-gray-500 text-lg">Manage all featured players displayed on the home page</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-[#00E5FF] font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create New Player
        </button>
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#171b2f] border border-gray-800 border-dashed rounded-[2rem]">
          <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-full flex justify-center items-center mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">No Featured Players</h3>
          <p className="text-gray-500 mb-6 text-center max-w-sm">You haven't added any featured players to the platform yet.</p>
          <button onClick={handleCreate} className="px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00cce6] text-[#080D2C] font-bold transition-all">
            Add Featured Player
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <div key={player.id} className="bg-[#171b2f] border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all flex flex-col group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0a0c16] border border-gray-700 relative">
                    {player.player_image ? (
                      <Image src={player.player_image as string} alt={player.player_name} fill className="object-cover" unoptimized />
                    ) : (
                      <Users className="w-6 h-6 text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-0 leading-tight">{player.player_name}</h3>
                    <p className="text-xs text-gray-400 font-medium">{player.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(player)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(player.id)} disabled={isDeleting} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors">
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800/50 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 rounded overflow-hidden relative border border-gray-700 bg-[#0a0c16]">
                    {player.flag_image ? <Image src={player.flag_image as string} alt="Flag" fill className="object-cover" unoptimized /> : <Flag size={10} className="text-gray-600 m-auto mt-0.5" />}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{player.country_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-800 text-gray-300">Ord: {player.order}</div>
                  {player.is_active ? (
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-500/10 text-green-400">Active</div>
                  ) : (
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-400">Inactive</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("General");

  const { data: settings, isLoading: isLoadingGet } = useGetGeneralSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateGeneralSettingsMutation();

  const [formData, setFormData] = useState<Partial<GeneralSettings>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      brandColors: {
        ...prev.brandColors!,
        [name]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "platformLogo" | "favicon") => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "platformLogo") setLogoPreview(reader.result as string);
        else setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const data = new FormData();

      const settingsData = {
        platformName: formData.platformName || "",
        tagline: formData.tagline || "",
        brandColors: formData.brandColors
      };

      data.append("data", JSON.stringify(settingsData));

      if (formData.platformLogo instanceof File) {
        data.append("platformLogo", formData.platformLogo);
      }
      if (formData.favicon instanceof File) {
        data.append("favicon", formData.favicon);
      }

      await updateSettings(data).unwrap();
      toast.success("Settings updated successfully");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update settings");
    }
  };

  if (isLoadingGet) {
    return (
      <div className="min-h-screen bg-[#0B0D2C] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D2C] text-white p-6 md:p-12 font-sans overflow-x-hidden relative">
      <div className="w-full flex flex-wrap gap-2 mb-8 pb-2 border-b border-gray-800/50">
        {[
          { id: 'General', label: 'General Identity', icon: <Settings size={18} /> },
          { id: 'Footer', label: 'Footer Cards', icon: <LayoutTemplate size={18} /> },
          { id: 'FeaturedPlayers', label: 'Featured Players', icon: <Users size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all relative ${activeTab === tab.id ? 'bg-[#171b2f] text-white border-t border-x border-gray-800' : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            <span className={activeTab === tab.id ? 'text-cyan-400' : ''}>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && <div className="absolute -bottom-[2px] left-0 w-full h-[3px] bg-cyan-400 z-10" />}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
                General Identity
              </h1>
              <p className="text-gray-500 text-lg">Manage platform identity and assets</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="px-8 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00cce6] text-[#080D2C] font-bold transition-all shadow-lg shadow-[#00E5FF]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className={cardClass}>
                <h2 className={sectionTitleClass}><Type size={20} className="text-cyan-400" /> Platform Identity</h2>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Platform Name</label>
                    <input name="platformName" value={formData.platformName || ""} onChange={handleChange} className={inputClass} placeholder="NextGen Pros" />
                  </div>
                  <div>
                    <label className={labelClass}>Tagline</label>
                    <input name="tagline" value={formData.tagline || ""} onChange={handleChange} className={inputClass} placeholder="Join the scouts" />
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <h2 className={sectionTitleClass}><Palette size={20} className="text-purple-400" /> Brand Colors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: "Primary Cyan", key: "primaryCyan" },
                    { label: "Primary Magenta", key: "primaryMagenta" },
                    { label: "Background Dark", key: "backgroundDark" },
                    { label: "Background Card", key: "backgroundCard" }
                  ].map((color) => (
                    <div key={color.key}>
                      <label className={labelClass}>{color.label}</label>
                      <div className="flex items-center gap-3 bg-[#0a0c16] border border-gray-800 rounded-xl p-2 pr-4 transition-all focus-within:border-cyan-500/50">
                        <input
                          type="color"
                          value={formData.brandColors?.[color.key as keyof typeof formData.brandColors] || "#000000"}
                          onChange={(e) => handleColorChange(color.key, e.target.value)}
                          className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer overflow-hidden"
                        />
                        <input
                          type="text"
                          value={formData.brandColors?.[color.key as keyof typeof formData.brandColors] || ""}
                          onChange={(e) => handleColorChange(color.key, e.target.value)}
                          className="bg-transparent border-none focus:outline-none text-white font-mono uppercase text-sm w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className={cardClass}>
                <h2 className={sectionTitleClass}><ImageIcon size={20} className="text-amber-400" /> Brand Assets</h2>

                <div className="space-y-8">
                  <div>
                    <label className={labelClass}>Platform Logo</label>
                    <div className="flex flex-col gap-4">
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "platformLogo")}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="flex items-center justify-center gap-3 w-full h-32 border-2 border-dashed border-gray-800 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group-hover:bg-[#0a0c16]"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                            <span className="text-sm text-gray-500 group-hover:text-gray-300">
                              {formData.platformLogo instanceof File ? formData.platformLogo.name : "Upload Logo"}
                            </span>
                          </div>
                        </label>
                      </div>
                      {(logoPreview || (typeof formData.platformLogo === 'string' && formData.platformLogo)) && (
                        <div className="rounded-xl overflow-hidden border border-gray-800 w-full bg-[#0a0c16] relative aspect-video">
                          <Image
                            src={logoPreview || (typeof formData.platformLogo === 'string' ? formData.platformLogo : '')}
                            alt="Logo Preview"
                            fill
                            className="object-contain p-4"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Favicon</label>
                    <div className="flex flex-col gap-4">
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "favicon")}
                          className="hidden"
                          id="favicon-upload"
                        />
                        <label
                          htmlFor="favicon-upload"
                          className="flex items-center justify-center gap-3 w-full h-24 border-2 border-dashed border-gray-800 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group-hover:bg-[#0a0c16]"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                            <span className="text-sm text-gray-500 group-hover:text-gray-300">
                              {formData.favicon instanceof File ? formData.favicon.name : "Upload Favicon"}
                            </span>
                          </div>
                        </label>
                      </div>
                      {(faviconPreview || (typeof formData.favicon === 'string' && formData.favicon)) && (
                        <div className="rounded-xl overflow-hidden border border-gray-800 w-24 h-24 bg-[#0a0c16] relative p-4 self-start">
                          <Image
                            src={faviconPreview || (typeof formData.favicon === 'string' ? formData.favicon : '')}
                            alt="Favicon Preview"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Footer" && <FooterCardsTab />}
      {activeTab === "FeaturedPlayers" && <FeaturedPlayersTab />}
    </div>
  );
}
