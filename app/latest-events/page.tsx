"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, ArrowLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { useGetEventsQuery } from "@/redux/features/admin/adminEventApi";
import Navbar from "@/components/sheard/Navbar";
import Footer from "@/components/sheard/Footer";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

export default function LatestEventsPage() {
  const router = useRouter();
  const theme = useAppSelector((state) => state.theme);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const { data: eventsData, isLoading } = useGetEventsQuery();
  const allEvents = eventsData?.data || [];
  
  // Filter out cancelled and completed events for the public listing
  const activeEvents = allEvents.filter(
    (event) => 
      event.status?.toUpperCase() !== "CANCELLED" && 
      event.status?.toUpperCase() !== "COMPLETED"
  );

  // Pagination logic
  const totalPages = Math.ceil(activeEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = activeEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEventClick = (id: number) => {
    router.push(`/latest-events/${id}`);
  };

  return (
    <main className="min-h-screen bg-[#050B14] flex flex-col pt-32">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 mb-12 max-w-7xl">
        <div className="mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent inline-block">
            LATEST EVENTS
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Stay updated with training tips, nutrition advice, and gear reviews through our exclusive events.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="bg-[#0B0D2C] border border-[#1E2554] rounded-2xl p-12 text-center">
            <p className="text-gray-400">No upcoming events at the moment. Please check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {currentEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-[#12143A] border border-[#1A2049] rounded-2xl overflow-hidden hover:border-[#2A3560] transition-all group p-8 flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[#06A295] font-semibold text-sm uppercase tracking-wider">
                      {event.status || "Upcoming"}
                    </span>
                    <span className="text-[#06A295] font-medium text-sm">
                      {(() => {
                        if (!event.date) return "TBD";
                        const d = new Date(event.date);
                        return !isNaN(d.getTime())
                          ? format(d, "dd MMM yyyy")
                          : event.date;
                      })()}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold mb-8 text-white leading-tight group-hover:text-cyan-400 transition-colors">
                    {event.event_name}
                  </h2>

                  <div className="space-y-4 mb-8 pb-8 border-b border-gray-700/50 flex-1">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-[#06A295]">08:00 AM (TBD)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-[#06A295]">
                        {event.location || "Location TBD"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-[#06A295]">
                        {event.fee === "0.00" || !event.fee
                          ? "Free Entry"
                          : `$${event.fee}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <button
                      onClick={() => handleEventClick(event.id)}
                      className="w-full bg-[#00F6FF]/10 text-[#00F6FF] hover:bg-[#00F6FF] hover:text-black font-bold py-3 rounded-xl transition-all duration-300 border border-[#00F6FF]/20"
                    >
                      See more details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 gap-3">
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                        currentPage === page
                          ? "bg-linear-to-r from-cyan-500 to-blue-500 border-transparent text-white shadow-lg shadow-cyan-500/20"
                          : "border-[#1E2554] bg-[#0B0D2C] text-gray-400 hover:text-white hover:border-cyan-400/50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-6 h-10 flex items-center justify-center rounded-lg border border-[#1E2554] bg-[#0B0D2C] text-gray-400 hover:text-white hover:border-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
