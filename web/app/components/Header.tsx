import Image from 'next/image'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)'}}>
      {/* Gradient top bar */}
      <div className="h-[2px] w-full" style={{background: 'linear-gradient(90deg, #C8102E 0%, #C8102E 20%, #1D428A 60%, transparent 100%)'}} />
      {/* Subtle red glow under bar */}
      <div className="h-[1px] w-full" style={{background: 'linear-gradient(90deg, rgba(200,16,46,0.3) 0%, transparent 50%)'}} />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{height: '42px'}}>
        {/* Logo + brand */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full" style={{boxShadow: '0 0 16px rgba(200,16,46,0.2)'}} />
            <Image src="/nba.png" alt="NBA" width={22} height={22} className="relative object-contain" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-black text-[12px] tracking-tight">Performance</span>
            <span className="font-black text-[12px] tracking-tight" style={{color: '#C8102E'}}>Signals</span>
          </div>
          <div
            className="hidden sm:inline-flex items-center text-[9px] font-black tracking-[0.2em] uppercase px-2 py-[3px] rounded-sm"
            style={{color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}
          >
            BETA
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background: '#22c55e', boxShadow: '0 0 6px #22c55e'}} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{color: 'rgba(255,255,255,0.3)'}}>Live</span>
          </div>
          <a
            href="https://github.com/arthurlins7/NBA_Perfomance_Signals.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] font-bold tracking-wide transition-all duration-150 px-3 py-1.5 rounded-md"
            style={{
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={undefined}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </header>
  )
}
