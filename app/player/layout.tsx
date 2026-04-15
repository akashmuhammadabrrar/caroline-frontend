import PlayerSideBar from '@/components/layout/PlayerSideBar'
import PlayerTopBar from '@/components/layout/PlayerTopBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import React from 'react'
import { poppins } from "@/app/font";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRole="PLAYER">
       <div className={`min-h-screen bg-gray-50 ${poppins.className} `}>
        <PlayerSideBar/>
        <div className="lg:ml-58.75 min-h-screen flex flex-col">
          <PlayerTopBar/>
          <main className="flex-1 p-4 lg:p-8 bg-[#0B0D2C]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
   
  )
}

export default Layout