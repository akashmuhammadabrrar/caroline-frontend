import ScoutSideBar from "@/components/layout/ScoutSidebar";
import ScoutTopBar from "@/components/layout/ScoutTopBar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import React from "react";
import { poppins } from "@/app/font";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRole="SCOUT_AGENT">
      <div className={`min-h-screen bg-gray-50 ${poppins.className} `}>
        <ScoutTopBar />
        <div className="lg:ml-58.75 min-h-screen flex flex-col">
          <ScoutSideBar />
          <main className="flex-1 p-4 lg:p-8 bg-[#0B0D2C]">
            <div>{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
