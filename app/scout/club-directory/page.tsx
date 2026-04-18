"use client";

import { useState } from "react";

import Link from "next/link";
import { CiLocationOn } from "react-icons/ci";
import { FaUsers } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { GoTrophy } from "react-icons/go";
import { PiBuildingOfficeLight } from "react-icons/pi";
import { useGetAllClubsQuery } from "@/redux/features/scout/clubDireactoryApi";
import Image from "next/image";
import { useRouter } from "next/navigation";

const countries = ["USA", "UK", "Germany", "France", "Spain"]; // Example countries, replace as needed

const ClubDirectoryPage = () => {
  const router = useRouter();
  const { data, isLoading, error } = useGetAllClubsQuery();

  // Filters & search state
  const [countryFilter, setCountryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Filter & sort
  const filteredClubs = data?.results
    .filter((club) => (countryFilter ? club.country === countryFilter : true))
    .filter((club) => (typeFilter ? club.club_type === typeFilter : true))
    .filter((club) =>
      club.club_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "players") return b.current_players - a.current_players;
      if (sortBy === "established")
        return a.established_year - b.established_year;
      return 0;
    });

  if (isLoading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Something went wrong</p>;

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6 inline-block pb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
        Player Discovery
      </h1>

      {/* Filters */}
      <div className="bg-[#11163C] rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <select
          className="bg-[#0d133d] text-white p-2 rounded"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="bg-[#0d133d] text-white p-2 rounded"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="academy">Academy</option>
          <option value="club">Club</option>
        </select>

        <select
          className="bg-[#0d133d] text-white p-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="players">Players</option>
          <option value="established">Established Year</option>
        </select>

        <input
          type="text"
          placeholder="Search ..."
          className="bg-[#0d133d] text-white p-2 rounded flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
        {filteredClubs?.map((club) => (
          <div
            key={club.id}
            className="bg-[#11163C] rounded-xl p-5 shadow-lg hover:scale-105 transition border border-[#04B5A3]/30 flex flex-col space-y-4"
          >
            {/* Logo & Info */}
            <div className="flex items-center gap-4">
              {club.club_logo ? (
                <Image
                  src={"/images/logo.png"}
                  alt={club.club_name}
                  width={60}
                  height={60}
                  sizes="60px"
                  style={{ width: "auto", height: "auto" }}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-white font-bold">I</span>
                </div>
              )}
              <div>
                <h2 className="text-white font-semibold text-lg">
                  {club.club_name}
                </h2>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <CiLocationOn className="text-[#04B5A3]" /> {club.location}
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <PiBuildingOfficeLight className="text-[#04B5A3]" />{" "}
                  {club.club_type}
                </p>
              </div>
            </div>

            {/* Players & Established */}
            <div className="flex justify-between text-gray-400">
              <div className="flex items-center gap-2">
                <FaUsers className="text-[#04B5A3]" /> {club.current_players}{" "}
                Players
              </div>
              <div className="flex items-center gap-2">
                <GoTrophy className="text-[#04B5A3]" /> {club.established_year}
              </div>
            </div>

            {/* Achievement */}
            <p className="text-gray-300 text-sm">
              <span className="text-white font-medium">
                Recent Achievement:
              </span>{" "}
              {club.recent_achievement}
            </p>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Link
                key={club.id}
                href={`/scout/club-directory/${club.id}`} // ✅ club.id must exist and be a number
                className="bg-[#04B5A3] text-white px-4 py-2 rounded-lg hover:bg-[#00E5FF] transition"
              >
                View Details
              </Link>
               <button 
                onClick={() => {
                  const query = new URLSearchParams();
                  query.set("userId", String(club.id)); // For clubs, the messaging page uses this to fetch detail and resolve user.id
                  query.set("role", "CLUB_ACADEMY");
                  router.push(`/scout/messaging?${query.toString()}`);
                }}
                className="border border-[#04B5A3]/70 flex justify-center items-center p-2 rounded-lg hover:bg-[#04B5A3]/10 transition-colors"
                title={`Message ${club.club_name}`}
              >
                <FaMessage className="text-[#04B5A3]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubDirectoryPage;
