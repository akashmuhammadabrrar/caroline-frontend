"use client";

import {
  Lock,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAppSelector } from "@/redux/hooks";
import SectionTitel from "../reuseable/SectionTitel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetUpcomingEventsQuery } from "@/redux/features/home/homeApi";
import { useGetMyRegistrationsQuery } from "@/redux/features/player/eventsDirectoryApi";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

export default function UpcomingEvent() {
  const router = useRouter();
  const theme = useAppSelector((state) => state.theme);
  const user = useAppSelector((state) => state.auth.user);
  const { data: eventsData, isLoading } = useGetUpcomingEventsQuery();

  const { data: registrationsData } = useGetMyRegistrationsQuery(undefined, {
    skip: !user || user.role !== "PLAYER",
  });

  const registrations = Array.isArray(registrationsData)
    ? registrationsData
    : (registrationsData as any)?.results ||
      (registrationsData as any)?.data ||
      [];

  // Get active/upcoming events and limit to 2, sorted by created_at descending
  const upcomingEvents = [...(eventsData?.data || [])]
    .filter(
      (e: any) =>
        e.status?.toUpperCase() !== "CANCELLED" &&
        e.status?.toUpperCase() !== "COMPLETED",
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    )
    .slice(0, 2);

  return (
    <div className="py-16 bg-[var(--bg-dark,#07142b)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9">
          <SectionTitel
            title="LATEST EVENTS"
            subtitle="Stay updated with training tips, nutrition advice, and gear reviews."
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48 mb-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center text-gray-400 h-48 flex flex-col justify-center items-center mb-12 border border-[#12143A] rounded-2xl bg-[#090C22]">
            <p>No upcoming events at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {upcomingEvents.map((event: any) => (
              <div
                key={event.id}
                className="rounded-2xl p-8 bg-[var(--bg-card,#12143A)]"
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

                <h2 className="text-lg md:text-xl font-bold mb-8 text-white leading-tight">
                  {event.event_name}
                </h2>

                <div className="space-y-4 mb-8 pb-8 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <Clock
                      className="w-5 h-5 text-cyan-400 flex-shrink-0"
                      style={{ color: theme.colors.primaryCyan }}
                    />
                    <span className="text-[#06A295]">08:00 AM (TBD)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin
                      className="w-5 h-5 text-cyan-400 flex-shrink-0"
                      style={{ color: theme.colors.primaryCyan }}
                    />
                    <span className="text-[#06A295]">
                      {event.location || "Location TBD"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users
                      className="w-5 h-5 text-cyan-400 flex-shrink-0"
                      style={{ color: theme.colors.primaryCyan }}
                    />
                    <span className="text-[#06A295]">
                      {event.fee === "0.00" || !event.fee
                        ? "Free Entry"
                        : `$${event.fee}`}
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-gray-400 font-semibold mb-4">
                    Contact information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail
                        className="w-4 h-4 text-cyan-400 flex-shrink-0"
                        style={{ color: theme.colors.primaryCyan }}
                      />
                      <span className="text-[#06A295] text-sm">
                        contact@nextgenpros.com
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone
                        className="w-4 h-4 text-cyan-400 flex-shrink-0"
                        style={{ color: theme.colors.primaryCyan }}
                      />
                      <span className="text-[#06A295] text-sm">
                        +1 234 567 890
                      </span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const reg = registrations.find((r: any) => {
                    const regEventId =
                      r.event_id ||
                      (typeof r.event === "object" && r.event !== null
                        ? r.event.id
                        : r.event);
                    return Number(regEventId) === Number(event.id);
                  });
                  const isRegistered = !!reg && reg.status !== "CANCELLED";
                  const isFull =
                    event.is_full ||
                    (event.maximum_capacity > 0 &&
                      event.registered_count >= event.maximum_capacity);

                  return (
                    <Button
                      variant="common"
                      disabled={
                        (isRegistered || isFull) && user?.role === "PLAYER"
                      }
                      onClick={() => {
                        if (!user) {
                          router.push("/login");
                          return;
                        }

                        const role = user.role?.toUpperCase();
                        if (role === "PLAYER") {
                          router.push(`/latest-events/${event.id}`);
                        } else if (role === "CLUB") {
                          router.push("/club/eventManagement");
                        } else if (role === "SCOUT") {
                          router.push("/scout/events");
                        } else if (role === "ADMIN") {
                          router.push("/admin/event-management");
                        } else {
                          router.push(`/latest-events/${event.id}`);
                        }
                      }}
                      className={`w-full font-semibold py-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                        isRegistered && user?.role === "PLAYER"
                          ? "bg-gray-800/80 text-cyan-400 border border-cyan-400/30 cursor-not-allowed"
                          : isFull && user?.role === "PLAYER"
                            ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                            : "text-white"
                      }`}
                    >
                      {isRegistered && user?.role === "PLAYER" ? (
                        <>Already Registered</>
                      ) : isFull && user?.role === "PLAYER" ? (
                        "Completed"
                      ) : (
                        "See more details"
                      )}
                    </Button>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <div className="flex justify-center mt-10">
            <button
              onClick={() => {
                if (!user) {
                  router.push("/latest-events");
                  return;
                }
                const role = user.role?.toUpperCase();
                if (role === "PLAYER") {
                  router.push("/player/eventsDirectory");
                } else if (role === "CLUB" || role === "CLUB_ACADEMY") {
                  router.push("/club/eventManagement");
                } else if (role === "SCOUT" || role === "SCOUT_AGENT") {
                  router.push("/scout/events");
                } else if (role === "ADMIN") {
                  router.push("/admin/eventManagement");
                } else {
                  router.push("/latest-events");
                }
              }}
              className="px-10 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-3"
            >
              View All Events <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div
          id="membership"
          className="min-h-screen flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className="
    w-full max-w-md 
    bg-gradient-to-br from-[#00E5FF]/20 via-[#00E5FF]/5 to-[#9C27B0]/30 
    p-4 sm:p-6 md:p-8
    border border-indigo-500/20 
    shadow-2xl shadow-indigo-950/40 rounded-xl
  "
          >
            <div className="bg-[#171D36]/90 p-4 sm:p-6 md:p-8 rounded-xl">
              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-lg">
                  ♔
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent text-center">
                GO PRO
              </h2>

              {/* Description */}
              <p className="text-[#7FB6B6] text-sm sm:text-base text-center mb-6 sm:mb-8 font-bold px-2">
                Unlock premium features and accelerate your football career with
                NextGen Pro membership
              </p>

              {/* Features */}
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-[#7FB6B6] text-xs sm:text-sm">
                {[
                  "Exclusive scout network access",
                  "Refined direct messaging system",
                  "Exclusive scout & agent network access",
                  "Newsletter with pre-season training content and priority event access",
                  "Full access to all events with direct contact options",
                  "Enhanced player profile creation with photos & videos to get noticed by clubs",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <span className="text-indigo-400 text-base sm:text-lg font-bold mt-0.5">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3">
                <div className="flex items-baseline text-[#9CFFF0]">
                  <span className="text-2xl sm:text-3xl font-black">$</span>
                  <span className="text-3xl sm:text-5xl font-black tracking-tight">
                    9.99
                  </span>
                  <span className="text-sm sm:text-xl font-bold ml-1 sm:ml-2">
                    /year
                  </span>
                </div>

                <div className="bg-gradient-to-r from-[#00E5FF] to-[#9C27B0] text-white text-[10px] sm:text-xs font-bold px-3 py-2 sm:px-4 sm:py-3 rounded-lg uppercase tracking-wide">
                  Save 50%
                </div>
              </div>

              <p className="text-[#7FB6B6] text-xs sm:text-sm text-center mb-6 sm:mb-8">
                (introductory offer — usually $19.99/year)
              </p>

              {/* Button */}
              <div className="flex justify-center">
                <Link
                  href={
                    user
                      ? user.role === "PLAYER"
                        ? "/player"
                        : user.role === "CLUB_ACADEMY"
                          ? "/club"
                          : user.role === "SCOUT_AGENT"
                            ? "/scout"
                            : "/admin"
                      : "/login"
                  }
                  className="w-full sm:w-auto text-center bg-[#00F6FF] text-black px-6 sm:px-8 py-3 text-sm sm:text-base font-bold rounded-full hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(0,246,255,0.3)]"
                >
                  {user ? "Go to Subscription" : "Sign Up"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
