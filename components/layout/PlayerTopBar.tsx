"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User as UserIcon } from "lucide-react";
import NotificationPopover from "./NotificationPopover";

import { useRouter } from "next/navigation";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import toast from "react-hot-toast";

const PlayerTopBar: React.FC = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  console.log("user data", user);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        event.target instanceof Node &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);



  const handleLogout = (): void => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#12143A]  border-2 border-[#00E5FF1A]">
      <div className="flex items-center justify-end px-4 lg:px-8 py-3">
     
        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <NotificationPopover />

          {/* Profile Dropdown */}
          <div className=" relative" ref={profileDropdownRef}>
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
              >
                {/* Profile Image OR First Letter */}
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#9C27B0] to-[#00E5FF] flex items-center justify-center text-white font-semibold text-lg">
                    {user?.first_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}

                {/* Name + Role */}
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-white  capitalize">{user?.role}</p>
                </div>
              </button>
            </div>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>

                <Link
                  href="/player"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <UserIcon className="mr-3 h-4 w-4 text-gray-500" />
                  Dashboard
                </Link>

                <Link
                  href="/player/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <UserIcon className="mr-3 h-4 w-4 text-gray-500" />
                  Profile
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PlayerTopBar;
