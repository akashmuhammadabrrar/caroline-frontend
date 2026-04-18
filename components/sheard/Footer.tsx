"use client";

import React, { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  InstagramIcon,
} from "lucide-react";
import BrandedLogo from "../reuseable/BrandedLogo";
import { useAppSelector } from "@/redux/hooks";
import { useGetPublicSettingsQuery } from "@/redux/features/home/homeApi";

const Footer = () => {
  const auth = useAppSelector((state) => state.auth);
  const { data: settings } = useGetPublicSettingsQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = !!auth?.user;
  const role = auth?.user?.role;

  return (
    <footer className="bg-(--bg-dark,#07142b) text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Logo Section */}
          <div>
            <div className="mb-4">
              <BrandedLogo variant="horizontal" width={106} height={63} />
            </div>

            <p className="text-sm mb-6">
              Connecting the next generation of football talent with
              opportunities worldwide.
            </p>

            <div className="flex gap-4">
              <InstagramIcon className="w-5 h-5 cursor-pointer hover:text-(--primary-cyan) transition" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-(--primary-cyan) transition" />
              <Youtube className="w-5 h-5 cursor-pointer hover:text-(--primary-cyan) transition" />
              <Facebook className="w-5 h-5 cursor-pointer hover:text-(--primary-cyan) transition" />
            </div>
          </div>

          {/* other sections remain same */}
          {/* Platforms */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platforms</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-(--primary-cyan) transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#membership"
                  className="hover:text-(--primary-cyan) transition"
                >
                  Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources / Dashboard Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {mounted && isAuthenticated ? "Dashboard Links" : "Resources Links"}
            </h3>
            <ul className="space-y-3 text-sm">
              {mounted && !isAuthenticated && (
                <>
                  <li>
                    <Link href="/latest-events" className="hover:text-(--primary-cyan) transition">
                      Events
                    </Link>
                  </li>
                </>
              )}

              {!mounted && (
                <>
                  <li>
                    <Link href="/latest-events" className="hover:text-(--primary-cyan) transition">
                      Events
                    </Link>
                  </li>
                </>
              )}

              {mounted && role === "PLAYER" && (
                <>
                  <li><Link href="/player" className="hover:text-(--primary-cyan) transition">Player Dashboard</Link></li>
                  <li><Link href="/player/profile" className="hover:text-(--primary-cyan) transition">My Profile</Link></li>
                  <li><Link href="/player/eventsDirectory" className="hover:text-(--primary-cyan) transition">Discover Events</Link></li>
                  <li><Link href="/player/messaging" className="hover:text-(--primary-cyan) transition">Messages</Link></li>
                </>
              )}

              {mounted && role === "SCOUT_AGENT" && (
                <>
                  <li><Link href="/scout" className="hover:text-(--primary-cyan) transition">Scout Dashboard</Link></li>
                  <li><Link href="/scout/playerDiscovery" className="hover:text-(--primary-cyan) transition">Player Discovery</Link></li>
                  <li><Link href="/scout/events" className="hover:text-(--primary-cyan) transition">Upcoming Events</Link></li>
                  <li><Link href="/scout/messaging" className="hover:text-(--primary-cyan) transition">Messages</Link></li>
                </>
              )}

              {mounted && role === "CLUB_ACADEMY" && (
                <>
                  <li><Link href="/club" className="hover:text-(--primary-cyan) transition">Club Dashboard</Link></li>
                  <li><Link href="/club/eventManagement" className="hover:text-(--primary-cyan) transition">Manage Events</Link></li>
                  <li><Link href="/club/messaging" className="hover:text-(--primary-cyan) transition">Messages</Link></li>
                </>
              )}

              {mounted && role === "ADMIN" && (
                <>
                  <li><Link href="/admin" className="hover:text-(--primary-cyan) transition">Admin Dashboard</Link></li>
                  <li><Link href="/admin/userManagement" className="hover:text-(--primary-cyan) transition">Manage Users</Link></li>
                  <li><Link href="/admin/eventManagement" className="hover:text-(--primary-cyan) transition">Manage Events</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Support section removed as all links were placeholders */}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} {settings?.platformName || "NextGen Pros"}. All rights reserved.</p>

          <div className="flex gap-6 mt-4 md:mt-0"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
