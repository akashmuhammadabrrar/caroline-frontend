/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useGetEventQuery,
  useGetScoutRegistrationsQuery,
} from "@/redux/features/scout/eventsApi";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CiLocationOn } from "react-icons/ci";
import { IoTimeOutline, IoCalendarOutline } from "react-icons/io5";
import { BsCheckCircleFill } from "react-icons/bs";
import { MdOutlineMail, MdOutlinePhone } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { GoOrganization } from "react-icons/go";

const EventDetailsPage = () => {
  const params = useParams();
  const eventId = params.id;

  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useGetEventQuery(Number(eventId));
  const { data: registrations, isLoading: regsLoading } =
    useGetScoutRegistrationsQuery();

  const isRegistered = registrations?.results
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registrations.results.some((reg: any) => reg.event === Number(eventId))
    : registrations?.some((reg: any) => reg.event === Number(eventId));

  if (eventLoading || regsLoading)
    return <div className="p-10 text-white">Loading event details...</div>;
  if (eventError || !event)
    return <div className="p-10 text-red-500">Error loading event details</div>;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Mock registered players
  const registeredPlayers = [
    {
      id: 1,
      name: "Lucas Martinez",
      role: "Midfielder",
      age: 17,
      country: "Spain",
      club: "FC Barcelona Youth",
      image: "/images/player-1.png",
    },
    {
      id: 2,
      name: "João Silva",
      role: "Forward",
      age: 18,
      country: "Portugal",
      club: "Benfica Academy",
      image: "/images/player-2.png",
    },
    {
      id: 3,
      name: "Marco Rossi",
      role: "Defender",
      age: 18,
      country: "Italy",
      club: "AC Milan Primavera",
      image: "/images/player-3.png",
    },
    {
      id: 4,
      name: "Thomas Müller Jr.",
      role: "Goalkeeper",
      age: 17,
      country: "Germany",
      club: "Bayern Munich Youth",
      image: "/images/player-4.png",
    },
    {
      id: 5,
      name: "Pierre Dubois",
      role: "Midfielder",
      age: 16,
      country: "France",
      club: "PSG Academy",
      image: "/images/player-1.png",
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Forward",
      age: 17,
      country: "England",
      club: "Chelsea FC Academy",
      image: "/images/player-2.png",
    },
  ];

  return (
    <div className=" pb-20 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/scout/events"
          className="text-white/60 hover:text-white flex items-center gap-2 text-sm transition-colors"
        >
          <span className="text-lg">←</span> Back to Events
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-10 h-[350px] md:h-[500px]">
        <Image
          src={event.event_media || "/images/event-banner.jpg"}
          alt={event.event_name}
          fill
          className="object-cover"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/40 to-transparent" />

        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex gap-3">
          <span className="bg-[#1DA1F2]/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-[#1DA1F2]/30 uppercase tracking-wider">
            {event.event_type}
          </span>
        </div>

        {event.is_featured && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <span className="bg-[#00E5FF] text-black text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              Featured Event
            </span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 uppercase tracking-tight line-clamp-2 md:line-clamp-none">
            {event.event_name}
          </h1>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 relative flex-shrink-0">
              <Image
                src={event.club_logo || "/images/club-logo.png"}
                alt={event.club_name || "Club Logo"}
                fill
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-xl font-bold text-[#00E5FF] truncate">
                {event.venue_name || "FC Barcelona Youth"}
              </p>
              <div className="flex items-center gap-2 text-white/70">
                <CiLocationOn className="text-[#00E5FF] flex-shrink-0" />
                <span className="text-xs md:text-sm truncate">
                  {event.city}, {event.country || "Spain"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
          {/* Event Details Grid */}
          <div className="bg-[#0D1424] border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8 bg-[#12143A]">
            <h2 className="text-lg md:text-xl font-bold text-white mb-6 md:mb-8 border-l-4 border-[#00E5FF] pl-4">
              Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-6 md:gap-x-12">
              <div className="flex items-start gap-4">
                <div className="bg-[#00E5FF]/10 p-2.5 md:p-3 rounded-xl flex-shrink-0">
                  <IoCalendarOutline className="text-[#00E5FF] text-lg md:text-xl" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5 md:mb-1">
                    Date
                  </p>
                  <p className="text-white text-sm md:text-base font-semibold">
                    {formatDate(event.event_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#00E5FF]/10 p-2.5 md:p-3 rounded-xl flex-shrink-0">
                  <IoTimeOutline className="text-[#00E5FF] text-lg md:text-xl" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5 md:mb-1">
                    Time
                  </p>
                  <p className="text-white text-sm md:text-base font-semibold">
                    {event.start_time.substring(0, 5)} -{" "}
                    {event.end_time.substring(0, 5)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#00E5FF]/10 p-2.5 md:p-3 rounded-xl flex-shrink-0">
                  <CiLocationOn className="text-[#00E5FF] text-lg md:text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5 md:mb-1">
                    Location
                  </p>
                  <p className="text-white text-sm md:text-base font-semibold truncate">
                    {event.venue_name}
                  </p>
                  <p className="text-white/60 text-xs md:text-sm mt-0.5 line-clamp-1">
                    {event.street_address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#00E5FF]/10 p-2.5 md:p-3 rounded-xl flex-shrink-0">
                  <span className="text-[#00E5FF] font-bold text-sm md:text-base">
                    $
                  </span>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5 md:mb-1">
                    Entry Fee
                  </p>
                  <p className="text-white font-black text-lg md:text-xl">
                    {Number(event.registration_fee) === 0
                      ? "Free"
                      : `$${event.registration_fee}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#00E5FF]/10 p-2.5 md:p-3 rounded-xl flex-shrink-0">
                  <FaUserFriends className="text-[#00E5FF] text-lg md:text-xl" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5 md:mb-1">
                    Age Group
                  </p>
                  <p className="text-white text-sm md:text-base font-semibold italic">
                    U{event.minimum_age} - U{event.maximum_age}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#00E5FF]/10 p-2.5 md:p-3 rounded-xl flex-shrink-0">
                  <BsCheckCircleFill className="text-[#00E5FF] text-lg md:text-xl" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5 md:mb-1">
                    Scouts Registered
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-black text-lg md:text-xl">
                      {event.registered_count}
                    </span>
                    <span className="text-white/40 text-xs md:text-sm">
                      / {event.maximum_capacity} Registered
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About This Event */}
            <div className="mt-8 md:mt-12 pt-6 md:pt-10 border-t border-white/5">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
                About This Event
              </h2>
              <p className="text-white/70 leading-relaxed text-xs md:text-sm">
                {event.description ||
                  "No description available for this event."}
              </p>
            </div>
          </div>

          {/* Registered Players Section */}
          <div>
            <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-3 mb-6 ">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                Registered Players
              </h2>
              <p className="text-white/40 text-xs md:text-sm mb-0.5 md:mb-1">
                {registeredPlayers.length} players participating
              </p>
            </div>

            <div className="space-y-4">
              {registeredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-[#12143A] border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#00E5FF]/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden relative border-2 border-white/10 group-hover:border-[#00E5FF]/50 transition-colors flex-shrink-0">
                      <Image
                        src={player.image}
                        alt={player.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-bold text-base md:text-lg truncate">
                        {player.name}
                      </h4>
                      <p className="text-xs md:text-sm flex flex-wrap items-center gap-x-2 gap-y-1 text-white/50">
                        <span className="text-[#00E5FF] font-medium whitespace-nowrap">
                          {player.role}
                        </span>
                        <span className="hidden xs:inline">•</span>
                        <span className="whitespace-nowrap">
                          {player.age} years
                        </span>
                        <span className="hidden xs:inline">•</span>
                        <span className="whitespace-nowrap">
                          {player.country}
                        </span>
                      </p>
                      <p className="text-[10px] md:text-xs text-white/30 mt-1 truncate">
                        {player.club}
                      </p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/20 hover:bg-[#1DA1F2] hover:text-white px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all">
                    <MdOutlineMail size={16} />
                    Contact
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-6 ">
          {/* Registration Card */}
          <div className="bg-[#12143A] border border-white/5 rounded-3xl p-8 sticky top-6">
            <h3 className="text-xl font-bold text-white mb-2 italic">
              Register as Scout
            </h3>
            <p className="text-white/40 text-xs mb-8">
              Register to observe players and access full event details
            </p>

            <Link
              href={
                isRegistered ? "#" : `/scout/eventRegister?eventId=${event.id}`
              }
              className={`w-full ${isRegistered ? "bg-gray-600 cursor-not-allowed" : "bg-[#00E5FF] hover:bg-[#00E5FF]/90"} text-black font-black py-4 rounded-xl text-center block transition-all shadow-[0_4px_20px_rgba(0,229,255,0.2)] mb-4 uppercase tracking-wider`}
            >
              {isRegistered ? "Registered" : "Register Now"}
            </Link>

            <p className="flex items-center justify-center gap-2 text-white/30 text-[10px] uppercase tracking-widest font-bold">
              <FaUserFriends />
              {event.maximum_capacity - event.registered_count} spots remaining
            </p>

            <div className="mt-10 pt-8 border-t border-white/5 space-y-6">
              <h4 className="text-white font-bold flex items-center gap-2">
                <GoOrganization className="text-[#00E5FF] text-xl" />
                Event Organizer
              </h4>

              <div className="space-y-4">
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">
                    Contact Person
                  </p>
                  <p className="text-white font-bold text-sm">
                    Carlos Rodriguez
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <MdOutlineMail className="text-white/60" />
                  </div>
                  <span className="text-xs text-[#00E5FF] font-medium break-all underline decoration-[#00E5FF]/30">
                    {/* {event.contact_email} */}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <MdOutlinePhone className="text-white/60" />
                  </div>
                  <span className="text-xs text-white/70 font-medium font-mono">
                    {/* {event.phone_number} */}
                  </span>
                </div>
              </div>

              <button className="w-full border border-white/10 hover:border-[#00E5FF]/50 text-white/60 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 mt-4">
                <MdOutlineMail />
                Contact Organizer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Remove duplicate import at the bottom
export default EventDetailsPage;
