import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[var(--bg-dark,#07142b)] relative overflow-hidden'>
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className='z-10 flex flex-col items-center bg-[var(--bg-card,#12143A)]/80 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.05)] max-w-lg w-full mx-4 text-center'>
        <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
           <AlertTriangle className="w-12 h-12 text-cyan-400 animate-pulse" />
        </div>
        
        <h2 className='text-8xl font-bold mb-2 tracking-tighter bg-linear-to-br from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text'>
          404
        </h2>
        <h3 className='text-2xl font-display font-semibold text-white mb-4'>Page Not Found</h3>
        <p className='text-gray-400 mb-8 leading-relaxed'>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          href="/" 
          className='flex items-center gap-3 px-8 py-4 bg-linear-to-r from-cyan-500 to-purple-600 rounded-full text-white font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]'
        >
          <Home size={20} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  )
}