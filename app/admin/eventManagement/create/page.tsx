/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  MapPin, 
  Clock, 
  Users, 
  ListOrdered, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Trash2,
  Calendar,
  DollarSign,
  Globe,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCreateEventMutation } from "@/redux/features/admin/adminEventApi";

const steps = [
  { id: 1, title: "Basic Info", icon: Info },
  { id: 2, title: "Location & Age", icon: MapPin },
  { id: 3, title: "Details & Contact", icon: FileText },
  { id: 4, title: "Schedules", icon: Clock },
  { id: 5, title: "Requirements", icon: ListOrdered },
  { id: 6, title: "Media & Status", icon: ImageIcon },
];

const CreateEventPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "TOURNAMENT",
    event_date: "",
    start_time: "",
    end_time: "",
    venue_name: "",
    street_address: "",
    city: "",
    postal_code: "",
    country: "",
    minimum_age: 14,
    maximum_age: 18,
    registration_fee: "",
    maximum_capacity: 100,
    description: "",
    requirements: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    event_media: "",
    status: "PENDING",
    is_featured: false,
    schedules: [
      { activity_title: "", description: "", start_time: "", end_time: "", order: 1 }
    ],
    event_requirements: [
      { requirement_title: "", requirement_description: "", is_mandatory: true, order: 1 }
    ]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleScheduleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedSchedules = [...formData.schedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [name]: value };
    setFormData(prev => ({ ...prev, schedules: updatedSchedules }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { activity_title: "", description: "", start_time: "", end_time: "", order: prev.schedules.length + 1 }
      ]
    }));
  };

  const removeSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const handleRequirementChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedRequirements = [...formData.event_requirements];
    if (name === 'is_mandatory') {
        updatedRequirements[index] = { ...updatedRequirements[index], [name]: value === 'true' };
    } else {
        updatedRequirements[index] = { ...updatedRequirements[index], [name]: value };
    }
    setFormData(prev => ({ ...prev, event_requirements: updatedRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      event_requirements: [
        ...prev.event_requirements,
        { requirement_title: "", requirement_description: "", is_mandatory: true, order: prev.event_requirements.length + 1 }
      ]
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      event_requirements: prev.event_requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await createEvent(formData).unwrap();
      if (res.success) {
        toast.success(res.message);
        router.push("/admin/eventManagement");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create event");
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Event Name</label>
                <input
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                  placeholder="e.g. International Youth Tournament"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Event Type</label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#0D1B2A] border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                >
                  <option value="TRIAL">TRIAL</option>
                  <option value="SHOWCASE">SHOWCASE</option>
                  <option value="TRAINING">TRAINING</option>
                  <option value="TOURNAMENT">TOURNAMENT</option>
                  <option value="WORKSHOP">WORKSHOP</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Event Date</label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all scheme-dark"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Venue Name</label>
                <input
                  name="venue_name"
                  value={formData.venue_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                  placeholder="e.g. Camp Nou"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all scheme-dark"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all scheme-dark"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-400">Street Address</label>
                <input
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                  placeholder="Street name, building etc."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Postal Code</label>
                <input
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Min Age</label>
                  <input
                    type="number"
                    name="minimum_age"
                    value={formData.minimum_age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Max Age</label>
                  <input
                    type="number"
                    name="maximum_age"
                    value={formData.maximum_age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Registration Fee</label>
                <div className="relative">
                   <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                   <input
                    type="text"
                    name="registration_fee"
                    value={formData.registration_fee}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Max Capacity</label>
                <input
                  type="number"
                  name="maximum_capacity"
                  value={formData.maximum_capacity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-400">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all resize-none"
                  placeholder="Summary of the event..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Contact Email</label>
                <input
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Contact Phone</label>
                <input
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Clock size={20} className="text-[#00E5FF]" /> Event Schedules
               </h3>
               <button 
                onClick={addSchedule}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-[#162d45] text-slate-300 hover:bg-white/10 transition-all text-xs font-bold"
               >
                 <Plus size={14} /> Add Activity
               </button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {formData.schedules.map((schedule, index) => (
                <div key={index} className="p-6 rounded-2xl bg-white/2 border border-[#162d45] relative group">
                  <button 
                    onClick={() => removeSchedule(index)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500">Activity Title</label>
                      <input
                        name="activity_title"
                        value={schedule.activity_title}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full px-4 py-2 rounded-xl bg-[#0D1B2A] border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm"
                        placeholder="e.g. Registration"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500">Description</label>
                      <textarea
                        name="description"
                        value={schedule.description}
                        onChange={(e) => handleScheduleChange(index, e)}
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl bg-[#0D1B2A] border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm resize-none"
                        placeholder="Detail about this activity..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">Start Time</label>
                      <input
                        type="time"
                        name="start_time"
                        value={schedule.start_time}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full px-4 py-2 rounded-xl bg-[#0D1B2A] border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm scheme-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">End Time</label>
                      <input
                        type="time"
                        name="end_time"
                        value={schedule.end_time}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full px-4 py-2 rounded-xl bg-[#0D1B2A] border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm scheme-dark"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <ListOrdered size={20} className="text-[#00E5FF]" /> Player Requirements
               </h3>
               <button 
                onClick={addRequirement}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-[#162d45] text-slate-300 hover:bg-white/10 transition-all text-xs font-bold"
               >
                 <Plus size={14} /> Add Requirement
               </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {formData.event_requirements.map((req, index) => (
                <div key={index} className="p-6 rounded-2xl bg-white/2 border border-[#162d45] relative group">
                  <button 
                    onClick={() => removeRequirement(index)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">Requirement Title</label>
                      <input
                        name="requirement_title"
                        value={req.requirement_title}
                        onChange={(e) => handleRequirementChange(index, e)}
                        className="w-full px-4 py-2 rounded-xl bg-[#0D1B2A] border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm"
                        placeholder="e.g. Passport Copy"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">Description</label>
                      <textarea
                        name="requirement_description"
                        value={req.requirement_description}
                        onChange={(e) => handleRequirementChange(index, e)}
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl bg-[#0D1B2A] border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        name="is_mandatory"
                        value={req.is_mandatory ? 'true' : 'false'}
                        onChange={(e) => handleRequirementChange(index, e)}
                        className="px-3 py-1.5 rounded-lg bg-[#0D1B2A] border border-[#162d45] text-xs text-white"
                      >
                        <option value="true">Mandatory</option>
                        <option value="false">Optional</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-400">Media URL (Banner/Thumbnail)</label>
                  <input
                    name="event_media"
                    value={formData.event_media}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Initial Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#0D1B2A] border border-[#162d45] text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-[#162d45]">
                  <input
                    type="checkbox"
                    name="is_featured"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded bg-white/5 border-[#162d45] text-[#00E5FF] focus:ring-[#00E5FF]"
                  />
                  <label htmlFor="is_featured" className="text-sm font-bold text-white cursor-pointer">
                    Feature this event on homepage
                  </label>
                </div>
             </div>

             <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
               <div className="flex items-center gap-3 text-blue-400 mb-2">
                 <CheckCircle2 size={20} />
                 <h4 className="font-bold uppercase tracking-widest text-xs">Ready to publish?</h4>
               </div>
               <p className="text-sm text-slate-400">Please review all steps before submitting. You can navigate back to make any changes.</p>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-8 bg-transparent">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
           <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/5 border border-[#162d45] text-slate-400 hover:text-white transition-all"
           >
             <ChevronLeft size={20} />
           </button>
           <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
             Create New Event
           </h1>
        </div>
        <p className="text-slate-400 ml-12">Complete the steps below to publish a new platform event.</p>
      </div>

      <div className="w-full">
        {/* Progress Stepper */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#162d45] -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] -translate-y-1/2 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between items-center">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                      currentStep >= step.id 
                        ? 'bg-[#0D1B2A] border-[#00E5FF] text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                        : 'bg-[#0D1B2A] border-[#162d45] text-slate-600'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${
                    currentStep >= step.id ? 'text-[#00E5FF]' : 'text-slate-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl p-8 backdrop-blur-sm shadow-2xl overflow-hidden relative">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               <span className="text-[#00E5FF]">Step {currentStep}:</span> {steps[currentStep - 1].title}
            </h2>
          </div>

          {renderStep()}

          {/* Footer Actions */}
          <div className="mt-10 pt-8 border-t border-[#162d45] flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                currentStep === 1 
                  ? 'bg-white/2 text-slate-700 cursor-not-allowed' 
                  : 'bg-white/5 border border-[#162d45] text-slate-300 hover:bg-white/10'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep === steps.length ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-linear-to-r from-[#00E5FF] to-[#9C27B0] text-white font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                Publish Event
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#04B5A3] text-white font-bold shadow-lg shadow-[#04B5A3]/20 hover:bg-[#039e8e] transition-all transform hover:scale-105 active:scale-95"
              >
                Next Step
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
