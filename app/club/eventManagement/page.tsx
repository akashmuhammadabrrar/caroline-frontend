/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Star,
  Save,
  Phone,
  Check,
  Mail,
  Clock,
  FileText,
  Info,
  ArrowRight,
  ArrowLeft,
  Upload,
  Link,
  Globe,
} from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  useGetClubEventsQuery,
  useGetClubEventDetailsQuery,
  useClubCreateEventMutation,
  useClubUpdateEventMutation,
  useClubDeleteEventMutation,
  useClubToggleFeaturedEventMutation,
} from "@/redux/features/club/clubEventManagementApi";
import { countryCodes } from "@/constants/countryCodes";

type Event = {
  id: string;
  name: string;
  event_type: string;
  date: string;
  location: string;
  fee: string;
  registrations: number;
  status: "Active" | "Pending" | "Completed";
  featured: boolean;
  views: number;
  confirmed: number;
  pending: number;
  capacity: number;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  minAge?: number;
  maxAge?: number;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  startTime?: string;
  endTime?: string;
  banner?: string | File | null;
  _raw?: unknown;
};

export default function EventManagementPage() {
  const { data: apiEvents, isLoading } = useGetClubEventsQuery(undefined);
  console.log("create event data ", apiEvents);
  const [createEvent] = useClubCreateEventMutation();
  const [updateEvent] = useClubUpdateEventMutation();
  const [deleteEventApi] = useClubDeleteEventMutation();
  const [toggleFeaturedApi] = useClubToggleFeaturedEventMutation();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  const events = useMemo(() => {
    if (!apiEvents) return [];

    // API might return a direct array or a paginated object with 'results'
    const sourceData = Array.isArray(apiEvents)
      ? apiEvents
      : (apiEvents as Record<string, unknown>).results ||
        (apiEvents as Record<string, unknown>).data ||
        (apiEvents as Record<string, unknown>).events ||
        [];

    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      return [];
    }

    const mapped = sourceData.map((apiEvent: Record<string, any>) => {
      // Robust mapping with fallbacks to ensure no empty fields
      const venue = apiEvent.venue_name || "Venue TBA";
      const addr = apiEvent.venue_address ? `, ${apiEvent.venue_address}` : "";

      let rawFee = apiEvent.registration_fee?.toString() || "0.00";
      const fee = rawFee.startsWith("€") ? rawFee : `€${rawFee}`;

      return {
        id: apiEvent.id?.toString() || Math.random().toString(),
        name: apiEvent.event_name || "Untitled Event",
        event_type: apiEvent.event_type || "TRIAL",
        date: apiEvent.event_date || "Date TBA",
        location: `${venue}${addr}`,
        fee: fee,
        registrations:
          apiEvent.registered_count ?? apiEvent.confirmed_count ?? 0,
        status: (apiEvent.status === "ACTIVE" ? "Active" : apiEvent.status === "COMPLETED" ? "Completed" : "Pending") as "Active" | "Pending" | "Completed",
        featured: apiEvent.featured ?? apiEvent.is_featured ?? false,
        views: apiEvent.views ?? apiEvent.views_count ?? 0,
        confirmed: apiEvent.confirmed_count ?? 0,
        pending: apiEvent.pending_count ?? 0,
        capacity: apiEvent.maximum_capacity ?? 100,
        description: apiEvent.description || "No description available.",
        contactEmail: apiEvent.contact_email || "N/A",
        contactPhone: apiEvent.contact_phone || "N/A",
        minAge: apiEvent.minimum_age ?? 16,
        maxAge: apiEvent.maximum_age ?? 21,
        streetAddress: apiEvent.street_address || "",
        city: apiEvent.city || "",
        postalCode: apiEvent.postal_code || "",
        country: apiEvent.country || "",
        startTime: apiEvent.start_time || "10:00:00",
        endTime: apiEvent.end_time || "14:00:00",
        banner: apiEvent.event_media || null,
        _raw: apiEvent,
      };
    });

    // Sorting: Try numeric ID first, fallback to date
    return [...mapped].sort((a, b) => {
      const idA = Number(a.id);
      const idB = Number(b.id);
      if (!isNaN(idA) && !isNaN(idB)) {
        return idB - idA;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [apiEvents]);

  const openView = (ev: Event) => {
    setSelectedEvent(ev);
    setMode("view");
  };
  const openEdit = (ev: Event) => {
    setSelectedEvent(ev);
    setMode("edit");
  };
  const closeModal = () => {
    setSelectedEvent(null);
    setMode(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEventApi(id).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFeaturedApi(id).unwrap();
    } catch (error) {
      console.error("Toggle featured failed:", error);
    }
  };

  const handleSaveEdit = async (updated: Event) => {
    try {
      const formDataToSend = new FormData();
      
      const eventData = {
        event_name: updated.name,
        event_type: "TRIAL",
        event_date: updated.date,
        start_time: updated.startTime || "10:00:00",
        end_time: updated.endTime || "14:00:00",
        venue_name: updated.location.split(",")[0] || "Venue Name",
        street_address: updated.streetAddress || updated.location.split(",")[1]?.trim() || "Street Address",
        city: updated.city || "City",
        postal_code: updated.postalCode || "00000",
        country: updated.country || "Country",
        minimum_age: updated.minAge || 12,
        maximum_age: updated.maxAge || 18,
        registration_fee: updated.fee.replace("€", ""),
        maximum_capacity: updated.capacity,
        description: updated.description || "",
        contact_email: updated.contactEmail || "contact@club.com",
        contact_phone: updated.contactPhone || "+0000000000",
        status: updated.status.toUpperCase(),
      };

      formDataToSend.append("data", JSON.stringify(eventData));

      if (updated.banner instanceof File) {
        formDataToSend.append("banner", updated.banner);
      }

      await updateEvent({ id: updated.id, body: formDataToSend }).unwrap();
      closeModal();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update event.");
    }
  };

  const handleCreateEvent = async (formData: any) => {
    const today = new Date().toISOString().split("T")[0];
    if (formData.date < today) {
      toast.error("Event date cannot be in the past.");
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      const eventData = {
        event_name: formData.name,
        event_type: formData.type.toUpperCase(),
        event_date: formData.date,
        start_time: formData.startTime || "10:00:00",
        end_time: formData.endTime || "14:00:00",
        venue_name: formData.location.venue,
        street_address: formData.location.address,
        city: formData.location.city,
        postal_code: formData.location.postalCode,
        country: formData.location.country,
        minimum_age: parseInt(formData.minAge) || 12,
        maximum_age: parseInt(formData.maxAge) || 18,
        registration_fee: formData.fee,
        maximum_capacity: parseInt(formData.capacity) || 100,
        description: formData.description,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        status: "PENDING",
      };

      formDataToSend.append("data", JSON.stringify(eventData));

      if (formData.banner instanceof File) {
        formDataToSend.append("banner", formData.banner);
      }

      await createEvent(formDataToSend).unwrap();
      setShowCreate(false);
      toast.success("Event created successfully!");
    } catch (error: any) {
      console.error("Create failed:", error);
      const errorData = error?.data?.errors;
      if (errorData?.non_field_errors) {
        toast.error(errorData.non_field_errors[0]);
      } else {
        toast.error("Failed to create event. Please check your data.");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f1229] text-gray-100 font-sans">
      <div className=" mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-4xl font-bold mb-6 inline-block pb-2 bg-gradient-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
            Event Management
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#04B5A3] hover:bg-[#039d8f] px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus size={18} /> Create Event
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#12143A]/90 backdrop-blur-sm border border-[#04B5A3]/30 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0B0D2C]">
                <tr>
                  <th className="px-6 py-7 text-left font-semibold">
                    Event Name
                  </th>
                  <th className="px-4 py-7 text-left">Date</th>
                  <th className="px-4 py-7 text-left">Location</th>
                  <th className="px-4 py-7 text-left">Fee</th>
                  <th className="px-4 py-7 text-center">Registrations</th>
                  <th className="px-4 py-7 text-center">Status</th>
                  <th className="px-4 py-7 text-center">Featured</th>
                  <th className="px-4 py-7 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#04B5A3]/30">
                {events.map((ev) => (
                  <tr key={ev.id} className=" transition-colors">
                    <td className="px-6 py-7 font-medium">{ev.name}</td>
                    <td className="px-4 py-4">{ev.date}</td>
                    <td className="px-4 py-4">{ev.location}</td>
                    <td className="px-4 py-4">{ev.fee}</td>
                    <td className="px-4 py-4 text-center">
                      {ev.registrations}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${ev.status === "Active" ? "bg-green-900/50 text-green-300 border border-green-500/20" : 
                          ev.status === "Completed" ? "bg-blue-900/50 text-blue-300 border border-blue-500/20" : 
                          "bg-amber-900/50 text-amber-300 border border-amber-500/20"}
                      `}
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(ev.id)}
                        className={`transition-all duration-300 hover:scale-110 ${ev.featured ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400/50"}`}
                        title={
                          ev.featured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                      >
                        <Star
                          size={20}
                          className="mx-auto"
                          fill={ev.featured ? "currentColor" : "none"}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openView(ev)}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openEdit(ev)}
                          className="text-[#04B5A3] hover:text-[#04B5A3]/40"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(ev.id)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 size={18} />
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

      {/* ─── View / Edit Modal ──────────────────────────────────────── */}
      {selectedEvent && mode && (
        <EventModal
          event={selectedEvent}
          mode={mode}
          onClose={closeModal}
          setMode={setMode}
          onSave={handleSaveEdit}
        />
      )}

      {/* ─── Delete Confirmation ────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12143A] border border-rose-800/50 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-rose-300 mb-4">
              Delete Event?
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <strong>
                {events.find((e) => e.id === showDeleteConfirm)?.name}
              </strong>
              ?<br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-600 rounded-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Multi-step Modal ────────────────────────────────── */}
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreateEvent}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Event View/Edit Modal
───────────────────────────────────────────────── */
type ModalProps = {
  event: Event;
  mode: "view" | "edit";
  onClose: () => void;
  onSave?: (updated: Event) => void;
  setMode: (mode: "view" | "edit" | null) => void;
};

function EventModal({ event, mode, onClose, onSave, setMode }: ModalProps) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(event);

  // Fetch full details if in "view" mode to get real participants
  const { data: details, isLoading: isDetailsLoading } = useGetClubEventDetailsQuery(event.id, {
    skip: !event.id || isEdit,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(form);
  };

  if (isEdit) {
    return (
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 lg:p-8 overflow-hidden">
        <div className="bg-[#0B0E1E] border border-[#1E2550] rounded-[24px] w-full max-w-[1280px] max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-[#1E2550]">
            <div className="flex items-center gap-5">
              <button
                onClick={onClose}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
                aria-label="Go back"
              >
                <ChevronLeft className="text-gray-400 group-hover:text-white" />
              </button>
              <div>
                <h2 className="text-[28px] font-bold text-cyan-400 leading-tight">
                  Edit Event
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Update event information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-transparent border border-[#1E2550] hover:bg-white/5 text-white font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-[#0B0E1E] font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                <div className="bg-[#0B0E1E]/20 p-1 rounded-md">
                  <Save size={16} />
                </div>
                Save Changes
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 grid lg:grid-cols-[1fr_360px] gap-8 overflow-y-auto custom-scrollbar">
            {/* Left Column: Form Cards */}
            <div className="space-y-6">
              {/* Event Image */}
              <div className="bg-[#121433] rounded-[20px] p-7 border border-[#1E2550]">
                <h3 className="text-xl font-bold text-white mb-6">
                  Event Media
                </h3>
                <input
                  type="file"
                  id="edit-event-banner-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setForm((prev) => ({ ...prev, banner: file }));
                    }
                  }}
                />
                <div
                  className="relative h-[240px] rounded-2xl overflow-hidden border border-[#1E2550] bg-[#0B0E1E] group cursor-pointer"
                  onClick={() =>
                    document.getElementById("edit-event-banner-upload")?.click()
                  }
                >
                  <img
                    src={
                      form.banner
                        ? typeof form.banner === "string"
                          ? form.banner
                          : URL.createObjectURL(form.banner)
                        : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
                    }
                    alt="Event Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={32} className="text-white mb-2" />
                    <p className="text-white font-bold">Change Image</p>
                  </div>
                </div>
              </div>
              {/* Basic Information */}
              <div className="bg-[#121433] rounded-[20px] p-7 border border-[#1E2550]">
                <h3 className="text-xl font-bold text-white mb-6">
                  Basic Information
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2.5">
                      Event Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                      placeholder="Youth Trial - Summer 2025"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Event Type
                      </label>
                      <div className="relative">
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:border-cyan-400/50 transition-colors capitalize"
                        >
                          <option value="Trial">Trial</option>
                          <option value="Showcase">Showcase</option>
                          <option value="Camp">Camp</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronRight size={18} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:border-cyan-400/50 transition-colors"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronRight size={18} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Date
                      </label>
                      <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Start Time
                      </label>
                      <input
                        name="startTime"
                        type="time"
                        value={form.startTime}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        End Time
                      </label>
                      <input
                        name="endTime"
                        type="time"
                        value={form.endTime}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Capacity */}
              <div className="bg-[#121433] rounded-[20px] p-7 border border-[#1E2550]">
                <h3 className="text-xl font-bold text-white mb-6">
                  Location & Capacity
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Venue Name
                      </label>
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="Stadium Name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Street Address
                      </label>
                      <input
                        name="streetAddress"
                        value={form.streetAddress}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="123 Main St"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        City
                      </label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Postal Code
                      </label>
                      <input
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Country
                      </label>
                      <input
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="USA"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Capacity
                      </label>
                      <input
                        name="capacity"
                        type="number"
                        value={form.capacity}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2.5">
                        Registration Fee
                      </label>
                      <input
                        name="fee"
                        value={form.fee}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="€50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="bg-[#121433] rounded-[20px] p-7 border border-[#1E2550]">
                <h3 className="text-xl font-bold text-white mb-6">
                  Event Description
                </h3>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                  placeholder="Tell us about your event..."
                />
              </div>

              {/* Contact Information */}
              <div className="bg-[#121433] rounded-[20px] p-7 border border-[#1E2550]">
                <h3 className="text-xl font-bold text-white mb-6">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2.5">
                      Contact Email
                    </label>
                    <input
                      name="contactEmail"
                      value={form.contactEmail}
                      onChange={handleChange}
                      className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                      placeholder="events@club.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2.5">
                      Contact Phone
                    </label>
                    <input
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={handleChange}
                      className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                      placeholder="+34 XXX XXX XXX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Statistics & Danger Zone */}
            <div className="space-y-6">
              {/* Event Statistics */}
              <div className="bg-[#121433] rounded-[20px] p-7 border border-[#1E2550]">
                <h3 className="text-lg font-bold text-white mb-5">
                  Event Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Views</span>
                    <span className="text-white font-semibold">1,234</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Capacity</span>
                    <span className="text-white font-bold">
                      <span className="text-cyan-400">{form.registrations}</span>
                      <span className="text-gray-500 mx-1">/</span>
                      {form.capacity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Confirmed</span>
                    <span className="text-emerald-400 font-bold">
                      {form.confirmed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-amber-400 font-bold">
                      {form.pending}
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#121433] rounded-[20px] p-7 border border-[#1E2550]">
                <h3 className="text-lg font-bold text-rose-500 mb-6 font-sans">
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <button className="w-full py-3.5 border border-rose-500/30 text-rose-500 text-sm font-semibold rounded-xl hover:bg-rose-500/5 transition-all">
                    Cancel Event
                  </button>
                  <button className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-bold rounded-xl transition-all">
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View Mode Layout
  return (
    <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 lg:p-8 overflow-hidden">
      <div className="w-full max-w-[1280px] h-full max-h-[90vh] mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
        {/* Top Navigation */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors w-fit group shrink-0"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Events</span>
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
          {/* Hero Section */}
          <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-8 relative overflow-hidden shrink-0 min-h-[300px] flex flex-col justify-end">
            {/* Background Image */}
            <img
              src={
                typeof event.banner === "string"
                  ? event.banner
                  : event.banner
                    ? URL.createObjectURL(event.banner)
                    : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
              }
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121433] via-[#121433]/60 to-transparent" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mt-auto">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {event.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1 bg-green-500/10 text-green-400 text-sm rounded-full font-medium border border-green-500/20">
                    Active
                  </span>
                  {event.featured && (
                    <span className="px-4 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full font-medium border border-cyan-500/20 flex items-center gap-1.5">
                      <Star size={14} fill="currentColor" /> Featured Event
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setMode("edit");
                }}
                className="bg-cyan-400 hover:bg-cyan-500 text-[#0B0E1E] px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-2 w-fit h-fit"
              >
                Edit Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/10">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Event Date
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {event.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/10">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {event.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/10">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Registration Capacity
                  </p>
                  <p className="text-lg font-bold text-white">
                    <span className="text-cyan-400">{event.registrations}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    {event.capacity} Players
                  </p>
                </div>
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 justify-center
          
          md:grid-cols-4 gap-4 shrink-0">
            {/* <QuickStat
              icon={<Eye size={20} />}
              label="Event Views"
              value={event.views.toString()}
              trend="Total Views"
            /> */}
            <QuickStat
              icon={<Users size={20} />}
              label="Total Registrations"
              value={event.registrations.toString()}
              trend={`${Math.round((event.registrations / Math.max(1, event.capacity)) * 100)}% filled`}
            />
            <QuickStat
              icon={<Check className="text-emerald-400" size={20} />}
              label="Confirmed"
              value={event.confirmed.toString()}
              trend={`${Math.round((event.confirmed / Math.max(1, event.registrations)) * 100) || 0}% confirmed`}
            />
            <QuickStat
              icon={<Calendar size={20} />}
              label="Pending"
              value={event.pending.toString()}
              trend={`${event.pending} awaiting confirmation`}
            />
          </div>

          {/* Main Details & Participants */}
          <div className="grid lg:grid-cols-[400px_1fr] gap-6">
            <div className="space-y-6">
              {/* Event Details */}
              <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
                <h3 className="text-xl font-bold text-white mb-6">
                  Event Details
                </h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Registration Fee
                    </p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {event.fee}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Event Time
                    </p>
                    <p className="text-white font-medium">10:00 AM - 4:00 PM</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Age Group
                    </p>
                    <p className="text-white font-medium">16-21 years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Capacity
                    </p>
                    <p className="text-white font-medium">
                      {event.capacity} participants
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
                <h3 className="text-xl font-bold text-white mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Mail size={18} className="text-cyan-400" />
                    <span className="text-sm font-medium">
                      {event.contactEmail || "contact@fcbarcelona.com"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Phone size={18} className="text-cyan-400" />
                    <span className="text-sm font-medium">
                      {event.contactPhone || "+34 902 189 900"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Participants */}
            <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7 flex flex-col">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <h3 className="text-xl font-bold text-white">
                  Registered Participants
                </h3>
                <div className="relative">
                  <input
                    placeholder="Search registrants..."
                    className="bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/50 w-64"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {isDetailsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto" />
                    <p className="text-gray-500 text-xs mt-2">Loading participants...</p>
                  </div>
                ) : (() => {
                  const rawData = details || event._raw as Record<string, unknown>;
                  const participants = Array.isArray(rawData?.participants) 
                    ? rawData.participants 
                    : Array.isArray(rawData?.registrations) 
                      ? rawData.registrations 
                      : (rawData as any)?.data?.participants || [];

                  if (participants.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <Users className="mx-auto text-gray-700 mb-2" size={32} />
                        <p className="text-gray-500 text-sm">No registered participants yet.</p>
                      </div>
                    );
                  }

                  return participants.map((participant: Record<string, unknown>, idx: number) => {
                    const name = typeof participant.name === "string" ? participant.name : 
                                 (typeof participant.first_name === "string" ? `${participant.first_name} ${participant.last_name || ""}` : "Unknown Player");
                    const role = typeof participant.role === "string" ? participant.role : 
                                 (typeof participant.position === "string" ? participant.position : (participant as any).event_type || "Player");
                    const age = participant.age ? String(participant.age) : "N/A";
                    const registeredDate = typeof participant.created_at === "string" ? new Date(participant.created_at).toLocaleDateString() : "Recently";

                    return (
                      <div
                        key={idx}
                        className="bg-[#0B0E1E]/50 border border-[#1E2550] rounded-[20px] p-4 flex items-center justify-between group hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-[#0B0E1E] flex items-center justify-center font-bold text-white uppercase">
                              {name[0] || "?"}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-white leading-tight">
                              {name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {role} • {age} years old
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                              Registered
                            </p>
                            <p className="text-xs font-semibold text-white">
                              {registeredDate}
                            </p>
                          </div>

                          <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-cyan-400 font-bold rounded-xl border border-white/5 transition-all text-sm">
                Load More Registrants
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-6 group hover:border-cyan-400/30 transition-all">
      <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-400 group-hover:text-[#0B0E1E] transition-all">
        {icon}
      </div>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-white leading-tight mb-2">
        {value}
      </p>
      <p
        className={`text-[10px] font-bold ${trend.includes("+") ? "text-green-400" : "text-cyan-400"}`}
      >
        {trend}
      </p>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="bg-[#1a1f4a]/50 rounded-xl p-4 border border-[#2a3366]">
      <div className="text-cyan-400 mb-1">{icon}</div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {trend && <div className="text-xs mt-1 text-cyan-300">{trend}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Multi-step Create Event Modal (simplified)
───────────────────────────────────────────────── */
function CreateEventModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    type: "Trial",
    minAge: "16",
    maxAge: "21",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    location: {
      venue: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Spain",
    },
    capacity: "100",
    fee: "50.00",
    description: "",
    requirements: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    banner: null as File | string | null,
  });

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const steps = [
    { id: 1, name: "Basic Info", icon: <Info size={18} /> },
    { id: 2, name: "Location", icon: <MapPin size={18} /> },
    { id: 3, name: "Details", icon: <FileText size={18} /> },
    { id: 4, name: "Review", icon: <Check size={18} /> },
  ];

  return (
    <div className="absolute inset-0  backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-8 overflow-hidden">
      <div className="w-full max-w-[1280px] h-full max-h-[90vh] mx-auto flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-5">
            <button
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5"
            >
              <ArrowLeft className="text-gray-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </button>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Create New Event
              </h2>
              <p className="text-gray-500 text-sm font-medium mt-1">
                Step {step} of 4 – Fill in all the details
              </p>
            </div>
          </div>
        </div>

        {/* Custom Progress Stepper */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-6 mb-8 shrink-0">
          <div className="flex items-center justify-between relative px-4">
            {/* Progress Bar Background */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[#1E2550] -translate-y-1/2 rounded-full z-0" />
            {/* Active Progress Line */}
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 -translate-y-1/2 rounded-full transition-all duration-500 z-0"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {steps.map((s) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div
                  key={s.id}
                  className="relative z-10 flex flex-col items-center gap-3"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isActive
                        ? "bg-gradient-to-br from-cyan-400 to-purple-500 text-[#0B0E1E] border-transparent scale-110 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                        : isCompleted
                          ? "bg-cyan-400 text-[#0B0E1E] border-transparent"
                          : "bg-[#0B0E1E] text-gray-500 border-[#1E2550]"
                    }`}
                  >
                    {isCompleted ? <Check size={20} /> : s.icon}
                  </div>
                  <span
                    className={`text-sm font-bold transition-all ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-8">
          {step === 1 && (
            <Step1 onNext={next} data={formData} updateData={setFormData} />
          )}
          {step === 2 && (
            <Step2
              onNext={next}
              onPrev={prev}
              data={formData}
              updateData={setFormData}
            />
          )}
          {step === 3 && (
            <Step3
              onNext={next}
              onPrev={prev}
              data={formData}
              updateData={setFormData}
            />
          )}
          {step === 4 && (
            <Step4
              onPrev={prev}
              onClose={onClose}
              data={formData}
              setStep={setStep}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-[#121433]/50 backdrop-blur-sm border border-[#1E2550] rounded-[24px] p-6 flex items-center justify-between shrink-0">
          <button
            onClick={step === 1 ? onClose : prev}
            className="px-8 py-3.5 bg-transparent border border-[#1E2550] hover:bg-white/5 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            {step === 1 ? "Cancel" : "Previous Step"}
          </button>
          <button
            onClick={() => {
              if (step === 4) {
                onSave(formData);
              } else {
                next();
              }
            }}
            className="px-10 py-3.5 bg-cyan-400 hover:bg-cyan-500 text-[#0B0E1E] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-2"
          >
            {step === 4 ? "Publish Event" : "Next Step"}
            {step !== 4 && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step1({
  onNext,
  data,
  updateData,
}: {
  onNext: () => void;
  data: any;
  updateData: any;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        {/* Event Information */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400">
              <Calendar size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Event Information</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Event Name *
              </label>
              <input
                value={data.name}
                onChange={(e) => updateData({ ...data, name: e.target.value })}
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-700"
                placeholder="e.g., Youth Summer Trial 2025"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Event Type *
              </label>
              <div className="relative">
                <select
                  value={data.type}
                  onChange={(e) =>
                    updateData({ ...data, type: e.target.value })
                  }
                  className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white appearance-none focus:outline-none focus:border-cyan-400/50 transition-all font-medium"
                >
                  <option value="Trial">Trial</option>
                  <option value="Showcase">Showcase</option>
                  <option value="Camp">Camp</option>
                  <option value="Tournament">Tournament</option>
                  <option value="Tournament">Leauge</option>
                  <option value="Tournament">National</option>
                </select>
                <ChevronRight
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-400 text-sm mb-2.5">
                  Minimum Age
                </label>
                <input
                  value={data.minAge}
                  onChange={(e) =>
                    updateData({ ...data, minAge: e.target.value })
                  }
                  className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                  placeholder="16"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2.5">
                  Maximum Age
                </label>
                <input
                  value={data.maxAge}
                  onChange={(e) =>
                    updateData({ ...data, maxAge: e.target.value })
                  }
                  className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                  placeholder="21"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <Clock size={20} className="text-[#04B5A3]" />
            </div>
            <h3 className="text-xl font-bold text-white">Date & Time</h3>
          </div>

          <div className="grid grid-cols-[1fr_120px_120px] gap-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Event Date *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={data.date}
                onChange={(e) => updateData({ ...data, date: e.target.value })}
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2.5 text-center">
                Start Time *
              </label>
              <input
                type="time"
                value={data.startTime}
                onChange={(e) =>
                  updateData({ ...data, startTime: e.target.value })
                }
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all text-center"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2.5 text-center">
                End Time
              </label>
              <input
                type="time"
                value={data.endTime}
                onChange={(e) =>
                  updateData({ ...data, endTime: e.target.value })
                }
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all text-center"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quick Tips */}
        <div className="bg-gradient-to-br from-[#121433] to-[#1a1f4d] border border-[#1E2550] rounded-[24px] p-7">
          <div className="w-12 h-12 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6">
            <Info size={24} className="text-[#04B5A3]" />
          </div>
          <h4 className="text-lg font-bold text-white mb-4">Quick Tips</h4>
          <ul className="space-y-4">
            {[
              "Use a clear, descriptive event name",
              "Choose the most specific age group",
              "Set realistic date and time",
              "Popular times: weekends 9AM-5PM",
            ].map((tip, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-400 leading-relaxed"
              >
                <span className="text-cyan-400 shrink-0 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Event Preview */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <h4 className="text-lg font-bold text-white mb-6">Event Preview</h4>
          <div className="bg-[#0B0E1E] rounded-2xl p-5 border border-[#1E2550]">
            <h5 className="text-cyan-400 font-bold mb-2">
              {data.name || "Event Name"}
            </h5>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                {data.type}
              </span>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                Age {data.minAge}-{data.maxAge}
              </span>
            </div>
            <div className="space-y-2 mt-4 pt-4 border-t border-[#1E2550]">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={14} className="text-[#04B5A3]" />
                {data.date || "dd/mm/yyyy"}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={14} className="text-[#04B5A3]" />
                {data.startTime || "00:00"} - {data.endTime || "00:00"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2({
  onNext,
  onPrev,
  data,
  updateData,
}: {
  onNext: () => void;
  onPrev: () => void;
  data: any;
  updateData: any;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        {/* Venue Location */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400">
              <MapPin size={20} className="text-[#04B5A3]" />
            </div>
            <h3 className="text-xl font-bold text-white">Venue Location</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Venue Name *
              </label>
              <input
                value={data.location.venue}
                onChange={(e) =>
                  updateData({
                    ...data,
                    location: { ...data.location, venue: e.target.value },
                  })
                }
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-700"
                placeholder="e.g., Campany Training Facilities"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Street Address *
              </label>
              <input
                value={data.location.address}
                onChange={(e) =>
                  updateData({
                    ...data,
                    location: { ...data.location, address: e.target.value },
                  })
                }
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-700"
                placeholder="123 Stadium Road"
              />
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="block text-gray-400 text-sm mb-2.5">
                  City *
                </label>
                <input
                  value={data.location.city}
                  onChange={(e) =>
                    updateData({
                      ...data,
                      location: { ...data.location, city: e.target.value },
                    })
                  }
                  className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                  placeholder="Barcelona"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2.5">
                  Postal Code
                </label>
                <input
                  value={data.location.postalCode}
                  onChange={(e) =>
                    updateData({
                      ...data,
                      location: {
                        ...data.location,
                        postalCode: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                  placeholder="08028"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2.5">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={data.location.country}
                    onChange={(e) =>
                      updateData({
                        ...data,
                        location: { ...data.location, country: e.target.value },
                      })
                    }
                    className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white appearance-none focus:outline-none focus:border-cyan-400/50 transition-all"
                  >
                    <option value="">Select Country</option>
                    {countryCodes.map((c) => {
                      const countryName = c.label.split(" (")[0];
                      return (
                        <option key={c.code} value={countryName}>
                          {countryName}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronRight
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Capacity & Pricing</h3>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Maximum Capacity *
              </label>
              <input
                type="number"
                value={data.capacity}
                onChange={(e) =>
                  updateData({ ...data, capacity: e.target.value })
                }
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                placeholder="100"
              />
              <p className="text-[10px] text-gray-600 mt-2">
                Maximum number of participants
              </p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Registration Fee *
              </label>
              <div className="relative">
                <input
                  value={data.fee}
                  onChange={(e) => updateData({ ...data, fee: e.target.value })}
                  className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-9 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                  placeholder="50.00"
                />
                <DollarSign
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-2">
                Use 0 for free events
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Location Tips */}
        <div className="bg-gradient-to-br from-[#121433] to-[#1a1f4d] border border-[#1E2550] rounded-[24px] p-7">
          <div className="w-12 h-12 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6">
            <MapPin size={24} />
          </div>
          <h4 className="text-lg font-bold text-white mb-4">Location Tips</h4>
          <ul className="space-y-4">
            {[
              "Provide exact venue address",
              "Ensure venue is easily accessible",
              "Consider parking availability",
              "Mention public transport options",
            ].map((tip, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-400 leading-relaxed"
              >
                <span className="text-cyan-400 shrink-0 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Guide */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <h4 className="text-lg font-bold text-white mb-6">Pricing Guide</h4>
          <div className="space-y-4">
            {[
              { label: "Trial Events:", price: "€30-€70" },
              { label: "Showcases:", price: "€50-€100" },
              { label: "Tournaments:", price: "€80-€150" },
              { label: "Camps:", price: "€200-€500" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-500">{item.label}</span>
                <span className="text-white font-bold">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3 & 4 left as placeholders — expand similarly
function Step3({
  onNext,
  onPrev,
  data,
  updateData,
}: {
  onNext: () => void;
  onPrev: () => void;
  data: any;
  updateData: any;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        {/* Event Description */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400">
              <FileText size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Event Description</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Full Description *
              </label>
              <textarea
                value={data.description}
                onChange={(e) =>
                  updateData({ ...data, description: e.target.value })
                }
                rows={5}
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-700 resize-none"
                placeholder="Provide detailed information about your event, what participants can expect, what they'll learn, the format, coaching staff involved, etc."
              />
              <p className="text-[10px] text-gray-600 mt-2">
                Minimum 100 characters recommended
              </p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2.5">
                Requirements & What to Bring
              </label>
              <textarea
                value={data.requirements}
                onChange={(e) =>
                  updateData({ ...data, requirements: e.target.value })
                }
                rows={3}
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-700 resize-none"
                placeholder="e.g., Football boots, shin guards, water bottle, medical certificate, etc."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <Phone size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">
              Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2.5 flex items-center gap-2">
                <Mail size={14} className="text-gray-600" /> Contact Email *
              </label>
              <input
                value={data.contactEmail}
                onChange={(e) =>
                  updateData({ ...data, contactEmail: e.target.value })
                }
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                placeholder="events@club.com"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2.5 flex items-center gap-2">
                <Phone size={14} className="text-gray-600" /> Contact Phone
              </label>
              <div className="flex bg-[#0B0E1E] border border-[#1E2550] rounded-xl overflow-hidden focus-within:border-cyan-400/50 transition-all text-white">
                <div className="relative border-r border-[#1E2550]">
                  <select
                    className="w-[90px] h-full bg-transparent pl-4 pr-6 py-4 outline-none appearance-none cursor-pointer text-sm"
                    onChange={(e) => {
                      const currentVal = data.contactPhone || "";
                      const parts = currentVal.includes(" ") ? currentVal.split(" ") : ["", currentVal];
                      const num = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
                      updateData({ ...data, contactPhone: `${e.target.value} ${num}` });
                    }}
                    value={(data.contactPhone || "+34 ").split(" ")[0]}
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#0B0E1E]">
                        {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
                </div>
                <input
                  value={(() => {
                    const currentVal = data.contactPhone || "+34 ";
                    const parts = currentVal.includes(" ") ? currentVal.split(" ") : ["", currentVal];
                    return parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
                  })()}
                  onChange={(e) => {
                    const currentVal = data.contactPhone || "+34 ";
                    const parts = currentVal.includes(" ") ? currentVal.split(" ") : ["+34", ""];
                    const code = parts[0];
                    updateData({ ...data, contactPhone: `${code} ${e.target.value}` });
                  }}
                  className="w-full bg-transparent px-4 py-4 focus:outline-none"
                  placeholder="XXX XXX XXX"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2.5 flex items-center gap-2">
              <Globe size={14} className="text-gray-600" /> Website (Optional)
            </label>
            <div className="relative">
              <input
                value={data.website}
                onChange={(e) =>
                  updateData({ ...data, website: e.target.value })
                }
                className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-9 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                placeholder="https://www.yourclub.com/event"
              />
              <Link
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Event Media */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400">
              <Upload size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Event Media</h3>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Event Banner Image</p>
            <input
              type="file"
              id="event-banner-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  updateData({
                    ...data,
                    banner: file,
                  });
                }
              }}
            />
            <div
              className={`border-2 border-dashed rounded-[24px] p-12 text-center transition-all cursor-pointer group relative overflow-hidden h-[240px] flex items-center justify-center ${
                data.banner
                  ? "border-cyan-400/50 bg-cyan-400/5"
                  : "border-[#1E2550] hover:border-cyan-400/30 hover:bg-white/5"
              }`}
              onClick={() =>
                document.getElementById("event-banner-upload")?.click()
              }
            >
              {data.banner ? (
                <>
                  <img
                    src={
                      typeof data.banner === "string"
                        ? data.banner
                        : URL.createObjectURL(data.banner)
                    }
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload size={32} className="text-white mb-2" />
                    <p className="text-white font-bold">Change Image</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <h4 className="text-white font-bold mb-2">
                      Click to upload or drag and drop
                    </h4>
                    <p className="text-xs text-gray-500">
                      Recommended: 1200x400px, PNG or JPG (max 5MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Featured Event Upsell */}
        <div className="bg-gradient-to-br from-purple-600/20 to-cyan-400/20 border border-purple-500/30 rounded-[24px] p-7 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Star size={20} fill="currentColor" />
              </div>
              <h4 className="text-lg font-bold text-white">Featured Event</h4>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Get 3x more visibility with featured placement at the top of
              search results.
            </p>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-8 group-hover:bg-white/10 transition-all">
              <p className="text-2xl font-black text-white">+€49.99</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                One-time promotional fee
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Priority placement",
                "Highlighted badge",
                "3x more views",
                "Email promotion",
              ].map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-300"
                >
                  <Check size={16} className="text-cyan-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Description Tips */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
          <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 mb-6">
            <FileText size={20} />
          </div>
          <h4 className="text-lg font-bold text-white mb-4">
            Description Tips
          </h4>
          <ul className="space-y-4">
            {[
              "Be clear and specific",
              "Highlight unique features",
              "Mention coaching staff",
              "Include success stories",
              "Add requirements clearly",
            ].map((tip, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-400 leading-relaxed"
              >
                <span className="text-cyan-400 shrink-0 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Step4({
  onPrev,
  onClose,
  data,
  setStep,
}: {
  onPrev: () => void;
  onClose: () => void;
  data: any;
  setStep: (s: number) => void;
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Banner Preview */}
      <div className="relative h-[240px] rounded-[32px] overflow-hidden border border-[#1E2550]">
        <img
          src={
            data.banner
              ? typeof data.banner === "string"
                ? data.banner
                : URL.createObjectURL(data.banner)
              : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
          }
          alt="Event Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E1E] via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <h3 className="text-3xl font-black text-white mb-3">
            {data.name || "Event Name Placeholder"}
          </h3>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-1.5 bg-cyan-400 text-[#0B0E1E] text-xs rounded-full font-black uppercase tracking-wider">
              {data.type}
            </span>
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs rounded-full font-bold border border-white/10 uppercase tracking-wider">
              Age {data.minAge}-{data.maxAge}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information Summary */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7 group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400">
                <Calendar size={20} />
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                Basic information
              </h4>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded-lg group-hover:border-cyan-400/20 transition-all"
            >
              <Edit size={14} /> Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Event Name
              </p>
              <p className="text-sm font-bold text-white">
                {data.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Event Type
              </p>
              <p className="text-sm font-bold text-white">{data.type}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Age Group
              </p>
              <p className="text-sm font-bold text-white">
                {data.minAge}-{data.maxAge} years
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Event Date
              </p>
              <p className="text-sm font-bold text-white">
                {data.date || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Start Time
              </p>
              <p className="text-sm font-bold text-white">
                {data.startTime || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                End Time
              </p>
              <p className="text-sm font-bold text-white">
                {data.endTime || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Venue & Location Summary */}
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7 group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                <MapPin size={20} />
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                Venue & Location
              </h4>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded-lg group-hover:border-cyan-400/20 transition-all"
            >
              <Edit size={14} /> Edit
            </button>
          </div>

          <div className="bg-[#0B0E1E] rounded-2xl p-4 border border-[#1E2550] mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h5 className="text-white font-bold leading-tight mb-1">
                  {data.location.venue || "Venue Name"}
                </h5>
                <p className="text-xs text-gray-500">
                  {data.location.address || "Street Address"}
                </p>
                <p className="text-xs text-gray-500">
                  {data.location.city}, {data.location.postalCode},{" "}
                  {data.location.country}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0B0E1E] rounded-2xl p-5 border border-[#1E2550]">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Maximum Capacity
              </p>
              <p className="text-xl font-black text-white">{data.capacity}</p>
              <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-tighter">
                participants
              </p>
            </div>
            <div className="bg-[#0B0E1E] rounded-2xl p-5 border border-[#1E2550]">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Registration Fee
              </p>
              <p className="text-xl font-black text-cyan-400">€{data.fee}</p>
              <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-tighter">
                per participant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Summary */}
      <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7 group">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400">
              <FileText size={20} />
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight">
              Event Details
            </h4>
          </div>
          <button
            onClick={() => setStep(3)}
            className="text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded-lg group-hover:border-cyan-400/20 transition-all"
          >
            <Edit size={14} /> Edit
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
              Event Description
            </p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-4xl">
              {data.description || "No description provided."}
            </p>
          </div>

          {data.requirements && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
                Requirements & What to Bring
              </p>
              <div className="bg-[#0B0E1E] border border-[#1E2550] rounded-xl p-4 text-sm text-gray-400 leading-relaxed max-w-4xl">
                {data.requirements}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
              Contact Information
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-[#0B0E1E] border border-[#1E2550] rounded-xl p-3.5">
                <Mail size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-gray-300 truncate">
                  {data.contactEmail || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-[#0B0E1E] border border-[#1E2550] rounded-xl p-3.5">
                <Phone size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-gray-300">
                  {data.contactPhone || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-[#0B0E1E] border border-[#1E2550] rounded-xl p-3.5">
                <Globe size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400/80 truncate underline decoration-cyan-400/20">
                  {data.website || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
