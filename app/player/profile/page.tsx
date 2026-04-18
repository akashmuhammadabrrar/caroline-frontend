"use client";

import ProfileEdit from "@/components/player/ProfileEdit";
import ProfileView from "@/components/player/ProfileView";
import { useGetMyProfileQuery } from "@/redux/features/player/playerProfileAndEdit/profileAndEditApi";
import { useState } from "react";

export default function ProfilePage() {
  const { data, isLoading, isError } = useGetMyProfileQuery();
// console.log('player data' , data)
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080D28",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        color: "#00E5FF",
        fontSize: 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #1E2554", borderTopColor: "#00E5FF",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          Loading profile...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080D28",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "sans-serif", color: "#FF3B30",
      }}>
        Failed to load profile. Please try again.
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080D28" }}>
      {!isEditing ? (
        <ProfileView
          profile={data}
          onEdit={() => setIsEditing(true)}
        />
      ) : (
        <ProfileEdit
          profile={data}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}