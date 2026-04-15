import React from "react";
import ClubSidebar from "@/components/layout/ClubSideBar";
import ClubTopBar from "@/components/layout/ClubTopBar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { poppins } from "@/app/font";
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRole="CLUB_ACADEMY">
      <div className={`min-h-screen bg-gray-50 ${poppins.className} `}>
      <ClubSidebar/>
        <div className="lg:ml-58.75 min-h-screen flex flex-col">
          <ClubTopBar/>
          <main className="flex-1 p-4 lg:p-8 bg-[#0B0D2C]">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
    
  );
};

export default Layout;
