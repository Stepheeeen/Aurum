"use client";

import BurnForm from "@/components/BurnForm";

export default function BurnPage() {
  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block border-t border-b border-yellow-600/30 py-3 px-8 mb-8">
            <span className="text-yellow-600 text-xs tracking-[0.3em] uppercase font-light">Token Burning</span>
          </div>
          
          <h1 className="font-luxury text-5xl md:text-7xl font-bold mb-6 gold-text">
            Burn Tokens
          </h1>
          
          <p className="font-elegant text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Permanently remove tokens from circulation. Reduce supply and increase scarcity with irreversible burns.
          </p>

          <div className="w-24 h-px bg-linear-to-r from-transparent via-yellow-600 to-transparent mx-auto"></div>
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
              <h3 className="font-semibold text-gray-300 mb-2 uppercase tracking-wider text-xs">Specify Amount</h3>
              <p className="text-gray-500 text-sm font-light">
                Enter token mint address and amount to burn
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-yellow-600 text-yellow-600 flex items-center justify-center font-luxury text-xl mx-auto mb-4">
                II
              </div>
              <h3 className="font-semibold text-gray-300 mb-2 uppercase tracking-wider text-xs">Pay Fee</h3>
              <p className="text-gray-500 text-sm font-light">
                0.15 SOL service fee (0.05 SOL with referral) is collected before burn
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-yellow-600 text-yellow-600 flex items-center justify-center font-luxury text-xl mx-auto mb-4">
                III
              </div>
              <h3 className="font-semibold text-gray-300 mb-2 uppercase tracking-wider text-xs">Tokens Burned</h3>
              <p className="text-gray-500 text-sm font-light">
                Tokens permanently removed from circulation
              </p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-12 border-2 border-red-900/30 bg-red-900/10 p-8 text-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="mb-4">
            <span className="inline-block w-16 h-16 border-2 border-red-400 text-red-400 flex items-center justify-center font-luxury text-3xl mx-auto">
              !
            </span>
          </div>
          <h3 className="font-luxury text-2xl font-semibold text-red-400 mb-3">
            Irreversible Action
          </h3>
          <p className="font-elegant text-gray-400 max-w-xl mx-auto leading-relaxed">
            Once tokens are burned, they cannot be recovered. This action permanently removes tokens from the total supply.
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-yellow-600/20 bg-linear-to-b from-yellow-600/5 to-transparent p-10 md:p-12 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <BurnForm />
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="text-center p-6 border border-gray-800">
            <div className="w-px h-12 bg-linear-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-4"></div>
            <h3 className="font-luxury text-lg font-semibold text-gray-200 mb-2">Deflationary</h3>
            <p className="text-gray-500 text-sm font-light">
              Reduce total supply to create scarcity and value
            </p>
          </div>

          <div className="text-center p-6 border border-gray-800">
            <div className="w-px h-12 bg-linear-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-4"></div>
            <h3 className="font-luxury text-lg font-semibold text-gray-200 mb-2">Verifiable</h3>
            <p className="text-gray-500 text-sm font-light">
              All burn transactions are publicly recorded on-chain
            </p>
          </div>

          <div className="text-center p-6 border border-gray-800">
            <div className="w-px h-12 bg-linear-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-4"></div>
            <h3 className="font-luxury text-lg font-semibold text-gray-200 mb-2">Instant</h3>
            <p className="text-gray-500 text-sm font-light">
              Tokens are burned immediately upon confirmation
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-16 text-center animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="inline-block border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 font-light">Use Cases</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="px-4 py-2 border border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                Supply Reduction
              </span>
              <span className="px-4 py-2 border border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                Buyback & Burn
              </span>
              <span className="px-4 py-2 border border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                Token Retirement
              </span>
              <span className="px-4 py-2 border border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                Deflationary Model
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Example */}
        <div className="mt-16 border border-gray-800 p-8 animate-slideUp" style={{ animationDelay: '0.5s' }}>
          <h3 className="font-luxury text-xl font-semibold text-center text-gray-300 mb-8">
            Why Burn Tokens?
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-yellow-600 font-semibold mb-2 uppercase tracking-wider text-xs">Increase Scarcity</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Reducing circulating supply can increase token value by making remaining tokens more scarce.
              </p>
            </div>
            <div>
              <h4 className="text-yellow-600 font-semibold mb-2 uppercase tracking-wider text-xs">Community Trust</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Demonstrable commitment to tokenomics builds confidence among holders and investors.
              </p>
            </div>
            <div>
              <h4 className="text-yellow-600 font-semibold mb-2 uppercase tracking-wider text-xs">Reward Holders</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Burning tokens can benefit existing holders through increased proportional ownership.
              </p>
            </div>
            <div>
              <h4 className="text-yellow-600 font-semibold mb-2 uppercase tracking-wider text-xs">Price Support</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Regular burns can provide support for token price through systematic supply reduction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
