/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import EventFilters from "@/components/scoutDashboard/event/EventFilterSelect";
import {
  useGetAllEventsQuery,
  useGetScoutRegistrationsQuery,
} from "@/redux/features/scout/eventsApi";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { SlLocationPin } from "react-icons/sl";

const Page = () => {
  // Filter states
  const [country, setCountry] = useState(""); // not used yet
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const filters = useMemo(() => {
    const params: any = { page, page_size: 6, ordering: "created_at" };
    if (eventType) params.event_type = eventType;
    if (date) params.event_date = date;
    if (debouncedSearch) params.search = debouncedSearch;

    return params;
  }, [eventType, date, debouncedSearch, page]);

  const { data, isLoading, error } = useGetAllEventsQuery(filters);
  const { data: registrations } = useGetScoutRegistrationsQuery();

  const sortedEvents = useMemo(() => {
    const events = data?.results;
    if (!events) return [];

    return [...events].sort((a: any, b: any) => {
      const aReg = registrations?.results
        ? registrations.results.some((r: any) => r.event === a.id)
        : registrations?.some((r: any) => r.event === a.id);
      const bReg = registrations?.results
        ? registrations.results.some((r: any) => r.event === b.id)
        : registrations?.some((r: any) => r.event === b.id);
      if (aReg !== bReg) {
        return aReg ? 1 : -1; // Unregistered (false) comes first
      }
      // If registration status is same, sort by created date (newest first)
      const timeA = new Date(a.created_at || a.event_date || 0).getTime();
      const timeB = new Date(b.created_at || b.event_date || 0).getTime();
      // If both dates are invalid/missing, fallback to ID sorting
      if (timeA === timeB) return b.id - a.id;
      return timeB - timeA;
    });
  }, [data, registrations]);

  const eventTypes = useMemo(() => {
    const events = data?.results;
    if (!events) return [];
    const types = new Set(events.map((e: any) => e.event_type));
    return Array.from(types);
  }, [data]);

  const countries = [
    "Spain",
    "Portugal",
    "France",
    "Germany",
    "England",
    "Brazil",
    "Italy",
  ];

  const handleReset = () => {
    setCountry("");
    setEventType("");
    setDate("");
    setSearch("");
    setPage(1);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Date formatter
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events</div>;

  return (
    <div className=" px-4">
      <h1 className="text-4xl font-bold mb-6 inline-block pb-2 bg-gradient-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
        Events
      </h1>

      {/* Filters */}
      <div className="mb-10">
        <EventFilters
          country={country}
          setCountry={setCountry}
          eventType={eventType}
          setEventType={setEventType}
          date={date}
          setDate={setDate}
          search={search}
          setSearch={setSearch}
          onReset={handleReset}
          countries={countries}
          eventTypes={eventTypes}
        />
      </div>

      {/* Card Grid */}
      <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 w-full">
        {sortedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-[#12143A] rounded-xl border border-[#00E5FF]/20 overflow-hidden hover:border-[#00E5FF]/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)]"
          >
            {/* Top bar with tags */}
            {/* Event Image Banner */}
            <div className="relative h-44 w-full p-2">
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={event.event_media || "/images/event-card.jpg"}
                  alt={event.event_name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12143A] via-transparent to-transparent" />

              {/* Tags */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-[#1DA1F2] text-white text-xs font-semibold px-3 py-1 rounded-md">
                  {event.event_type}
                </span>
              </div>

              {event.is_featured && (
                <div className="absolute top-3 right-3">
                  <span className="bg-[#2DD4BF] text-[#0f1238] text-xs font-semibold px-3 py-1 rounded-md">
                    Featured
                  </span>
                </div>
              )}
            </div>

            <div className="p-5">
              <h2 className="text-white text-xl font-bold mb-3">
                {event.event_name}
              </h2>

              {/* Club & location */}
              <div className="flex items-start gap-3 mb-4">
                <Image
                  src={event.club_logo || "/images/club-logo.png"}
                  alt={event.club_name || "club logo"}
                  width={50}
                  height={50}
                />
                <div>
                  <p className="text-white font-medium">{event.venue_name}</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                    <SlLocationPin size={14} className="text-gray-500" />
                    {event.location || "Location TBD"}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-700/50 my-4" />

              {/* Date & Time + Entry Fee */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">
                    Date & Time
                  </p>
                  <p className="text-white text-sm font-semibold">
                    {formatDate(event.event_date)}
                  </p>
                  <p className="text-white text-sm font-semibold">
                    {event.start_time ? event.start_time.substring(0, 5) : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">
                    Entry Fee
                  </p>
                  <p className="text-white text-xl font-bold">
                    {Number(event.registration_fee) === 0
                      ? "Free"
                      : `$${event.registration_fee}`}
                  </p>
                </div>
              </div>

              {/* Scouts registered + Location venue */}
              <div className="mb-6">
                <div className="">
                  <span className="text-[#2DD4BF] font-bold text-lg">
                    {event.registered_count}
                  </span>
                  <span className="text-gray-400 text-sm ml-1">
                    / {event.maximum_capacity} Scouts Registered
                  </span>
                  <div className="mt-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-white text-sm font-medium">
                      {event.location || "Venue TBD"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                {(() => {
                  const isRegistered = registrations?.results
                    ? registrations.results.some(
                        (reg: any) => reg.event === event.id,
                      )
                    : registrations?.some((reg: any) => reg.event === event.id);
                  return (
                    <Link
                      href={
                        isRegistered
                          ? "#"
                          : `/scout/eventRegister?eventId=${event.id}`
                      }
                      className={`flex-1 ${isRegistered ? "bg-gray-600 cursor-not-allowed" : "bg-[#04B5A3] hover:bg-[#2DD4BF]"} text-white flex items-center justify-center text-sm font-semibold py-2.5 rounded-lg text-center transition-colors`}
                    >
                      {isRegistered ? "Registered" : "Register Now"}
                    </Link>
                  );
                })()}
                <Link
                  href={`/scout/events/${event.id}`}
                  className="flex-1 border border-[#04B5A3] text-[#04B5A3] hover:bg-[#04B5A3]/10 flex items-center justify-center text-sm font-semibold py-2.5 rounded-lg text-center transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-6 mt-12 mb-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-6 py-2 rounded-lg border border-[#2DD4BF]/40 text-[#2DD4BF] text-sm font-semibold hover:bg-[#2DD4BF]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors w-24"
        >
          Previous
        </button>
        <span className="text-[#2DD4BF] font-semibold">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.next}
          className="px-6 py-2 rounded-lg border border-[#2DD4BF]/40 text-[#2DD4BF] text-sm font-semibold hover:bg-[#2DD4BF]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors w-24"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Page;
