"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, ChevronDown, Bell } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import gsap from "gsap";
import Link from "next/link";
import { logout } from "@/redux/features/auth/authSlice";
import { UserRole } from "@/types/auth";
import { useNotifications } from "@/components/providers/NotificationProvider";
import NotificationDropdown from "./NotificationDropdown";
import NotificationModal from "./NotificationModal";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useGetPublicSettingsQuery } from "@/redux/features/home/homeApi";
import BrandedLogo from "../reuseable/BrandedLogo";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Membership", href: "/#membership" },
  { name: "Academies", href: "/#academies" },
  { name: "Players", href: "/#players" },
  { name: "Latest News", href: "/latest-news" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  const auth = useAppSelector((state) => state.auth);
  const { unreadCount } = useNotifications();
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const navRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const getDashboardHref = (role?: UserRole) => {
    switch (role) {
      case "ADMIN": return "/admin";
      case "PLAYER": return "/player";
      case "SCOUT_AGENT": return "/scout";
      case "CLUB_ACADEMY": return "/club";
      default: return "/";
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (notifMenuOpen && notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setNotifMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setNotifMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [userMenuOpen, notifMenuOpen]);

  return (
    <nav ref={navRef} className="fixed top-8 left-0 right-0 w-full z-50 ">
      <div className="container mx-auto px-4 lg:px-6 relative bg-white/10 backdrop-blur-md rounded-xl border border-white/5 shadow-lg">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo - Left */}
          <BrandedLogo
            variant="stacked"
            width={106}
            height={63}
            hideNameOnMobile={true}
            hideFallback={true}
            className="hover:scale-105 transition-transform duration-200"
          />

          {/* Desktop Nav Links - Center */}
          <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "transition-all font-medium text-[15px] whitespace-nowrap relative group py-2",
                      isActive ? "text-cyan-400" : "text-[#B0B0B0] hover:text-white"
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            {(!mounted || !auth.user) ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-6 py-2.5 text-sm font-bold text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 text-sm font-bold bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                {/* Notification Bell */}
                <div ref={notifMenuRef} className="relative">
                  <button
                    onClick={() => {
                      setNotifMenuOpen(!notifMenuOpen);
                      setUserMenuOpen(false);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all relative group",
                      notifMenuOpen
                        ? "bg-teal-400 text-teal-950 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                        : "bg-[#050B14]/40 border-white/10 text-white hover:bg-[#050B14]/60"
                    )}
                  >
                    <Bell size={20} className={cn(unreadCount > 0 && "animate-none")} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-fuchsia-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#050B14] shadow-sm">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifMenuOpen && (
                    <NotificationDropdown
                      onClose={() => setNotifMenuOpen(false)}
                      onOpenModal={() => {
                        setNotifMenuOpen(false);
                        setNotifModalOpen(true);
                      }}
                    />
                  )}
                </div>

                <NotificationModal
                  isOpen={notifModalOpen}
                  onClose={() => setNotifModalOpen(false)}
                />

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen((v) => !v);
                      setNotifMenuOpen(false);
                    }}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-3 pr-4 p-1 rounded-full bg-[#050B14]/40 hover:bg-[#050B14]/60 backdrop-blur-md border border-white/10 transition-all group"
                  >
                    {auth.user.profile_image ? (
                      <div className="relative w-9 h-9">
                        <Image
                          src={auth.user.profile_image}
                          alt="Profile"
                          fill
                          className="rounded-full object-cover border border-[#00E5FF]/30"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#00E5FF] to-[#9C27B0] flex items-center justify-center text-[11px] font-bold text-white shadow-inner">
                        {auth.user.first_name?.[0]}
                        {auth.user.last_name?.[0]}
                      </div>
                    )}
                    <div className="flex flex-col items-start mr-1 text-left">
                      <span className="text-sm font-bold text-white leading-tight">
                        {auth.user.first_name} {auth.user.last_name}
                      </span>
                      <span className="text-[9px] text-[#00E5FF] font-black uppercase tracking-widest leading-tight">
                        {auth.user.role?.replace("_", " ")}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    role="menu"
                    className={`absolute right-0 mt-3 w-44 rounded-xl bg-[#161C39]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition origin-top-right z-[60] overflow-hidden ${userMenuOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                      }`}
                  >
                    <Link
                      href={getDashboardHref(auth.user?.role)}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors border-b border-white/5"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        dispatch(logout());
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white/80 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-7 rounded-xl border-t border-white/10 bg-blur backdrop-blur-md">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-base font-medium py-2 transition-colors",
                      isActive ? "text-cyan-400" : "text-white/80 hover:text-[#00E5FF]"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-3 pt-4">
                {auth.user ? (
                  <>
                    <div className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 mb-2">
                      {auth.user.profile_image ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={auth.user.profile_image}
                            alt="Profile"
                            fill
                            className="rounded-full object-cover border border-[#00E5FF]/30"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#00E5FF] to-[#9C27B0] flex items-center justify-center text-lg font-bold shadow-inner text-white">
                          {auth.user.first_name?.[0]}
                          {auth.user.last_name?.[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-white text-base font-bold">
                          {auth.user.first_name} {auth.user.last_name}
                        </div>
                        <div className="text-[10px] text-[#00E5FF] font-black uppercase tracking-widest mt-1">
                          {auth.user.role?.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={getDashboardHref(auth.user?.role)}
                      className="w-full px-4 py-3 rounded-md bg-white/5 text-center text-sm text-gray-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Button
                      variant="nav"
                      size="default"
                      className="w-full"
                      onClick={() => dispatch(logout())}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="nav" size="default" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        variant="navFilled"
                        size="default"
                        className="w-full"
                      >
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
