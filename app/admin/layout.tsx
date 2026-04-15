import AdminSideBar from "@/components/layout/AdminSideBar";
import AdminTopBar from "@/components/layout/AdminTopBar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React from "react";
import { poppins } from "@/app/font";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRole="ADMIN">
      <div className={`min-h-screen bg-gray-50 ${poppins.className} `}>
        <AdminSideBar />
        <div className="lg:ml-58.75 min-h-screen flex flex-col">
          <AdminTopBar />
          <main className="flex-1 p-4 lg:p-8 bg-[#0B0D2C]">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
    
  );
};

export default Layout;
