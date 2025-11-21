"use client";

import LockerForm from "@/components/LockerForm";

export default function LockerPage() {
  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block border-t border-b border-yellow-600/30 py-3 px-8 mb-8">
            <span className="text-yellow-600 text-xs tracking-[0.3em] uppercase font-light">Token Locking</span>
          </div>
          
          <h1 className="font-luxury text-5xl md:text-7xl font-bold mb-6 gold-text">
            Secure Locker
          </h1>
          
          <p className="font-elegant text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Time-lock your tokens with precision and security. Perfect for vesting schedules and supply management.
          </p>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto"></div>
        </div>

        {/* Instructions */}
        <div className="mb-12 border border-yellow-600/20 bg-yellow-600/5 p-8 animate-slideUp">
          <h2 className="font-luxury text-xl font-semibold text-yellow-600 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-yellow-600 text-yellow-600 flex items-center justify-center font-luxury text-xl mx-auto mb-4">
                I
              </div>
              <h3 className="font-semibold text-gray-300 mb-2 uppercase tracking-wider text-xs">Configure Lock</h3>
              <p className="text-gray-500 text-sm font-light">
                Enter token mint address, amount, and unlock date
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-yellow-600 text-yellow-600 flex items-center justify-center font-luxury text-xl mx-auto mb-4">
                II
              </div>
              <h3 className="font-semibold text-gray-300 mb-2 uppercase tracking-wider text-xs">Pay Fee</h3>
              <p className="text-gray-500 text-sm font-light">
                0.3 SOL service fee (0.2 SOL with referral) is collected before lock
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-yellow-600 text-yellow-600 flex items-center justify-center font-luxury text-xl mx-auto mb-4">
                III
              </div>
              <h3 className="font-semibold text-gray-300 mb-2 uppercase tracking-wider text-xs">Tokens Secured</h3>
              <p className="text-gray-500 text-sm font-light">
                Tokens transferred to escrow until unlock date
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="border border-yellow-600/20 bg-gradient-to-b from-yellow-600/5 to-transparent p-10 md:p-12 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <LockerForm />
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="text-center p-6 border border-gray-800">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-4"></div>
            <h3 className="font-luxury text-lg font-semibold text-gray-200 mb-2">Time-Locked</h3>
            <p className="text-gray-500 text-sm font-light">
              Tokens remain secured until your specified unlock date
            </p>
          </div>

          <div className="text-center p-6 border border-gray-800">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-4"></div>
            <h3 className="font-luxury text-lg font-semibold text-gray-200 mb-2">Transparent</h3>
            <p className="text-gray-500 text-sm font-light">
              All lock transactions are visible on Solana Explorer
            </p>
          </div>

          <div className="text-center p-6 border border-gray-800">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-4"></div>
            <h3 className="font-luxury text-lg font-semibold text-gray-200 mb-2">Reliable</h3>
            <p className="text-gray-500 text-sm font-light">
              Built on Solana's secure blockchain infrastructure
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-16 text-center animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="inline-block border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 font-light">Use Cases</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="px-4 py-2 border border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                Vesting Schedules
              </span>
              <span className="px-4 py-2 border border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                Team Tokens
              </span>
              <span className="px-4 py-2 border border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                Liquidity Lock
              </span>
              <span className="px-4 py-2 border border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                Supply Management
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
