import Link from "next/link";
import ConnectWalletButton from "@/components/ConnectWalletButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-32 md:py-40 relative">
          <div className="text-center animate-fadeIn">
            <div className="mb-12">
              <div className="inline-block border-t border-b border-yellow-600/30 py-3 px-8 mb-8">
                <span className="text-yellow-600 text-sm tracking-[0.3em] uppercase font-light">Premium Token Creation</span>
              </div>
            </div>

            <h1 className="font-luxury text-6xl md:text-8xl font-bold mb-8 gold-text leading-tight">
              AURUM
            </h1>
            
            <p className="font-elegant text-2xl md:text-3xl text-gray-300 mb-4 tracking-wide">
              Solana Token Atelier
            </p>

            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Craft bespoke digital assets with unparalleled elegance. 
              Where sophistication meets blockchain innovation.
            </p>

            <div className="flex flex-col items-center gap-6 mb-16">
              <ConnectWalletButton />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto mt-20 pt-12 border-t border-gray-800">
              <div className="text-center">
                <div className="font-luxury text-4xl md:text-5xl gold-text mb-2 font-semibold">
                  &lt;60s
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-light">Deployment</p>
              </div>
              
              <div className="text-center border-l border-r border-gray-800">
                <div className="mb-2">
                  <div className="font-luxury text-2xl text-gray-600 line-through mb-1">
                    1.2 SOL
                  </div>
                  <div className="font-luxury text-4xl md:text-5xl gold-text font-semibold">
                    0.6 SOL
                  </div>
                  <div className="text-xs text-yellow-600/80 mt-1 font-light">
                    (0.5 SOL with referral)
                  </div>
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-light">Creation Fee</p>
              </div>
              
              <div className="text-center">
                <div className="font-luxury text-4xl md:text-5xl gold-text mb-2 font-semibold">
                  100%
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-light">Sovereign</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-32 border-t border-gray-900">
        <div className="text-center mb-20">
          <h2 className="font-luxury text-5xl md:text-6xl font-bold gold-text mb-6">
            Excellence by Design
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mb-6"></div>
          <p className="font-elegant text-xl text-gray-400 max-w-2xl mx-auto">
            Meticulously engineered for discerning creators
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="group text-center">
            <div className="mb-6">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-6"></div>
              <h3 className="font-luxury text-2xl font-semibold text-gray-200 mb-4">Instantaneous</h3>
            </div>
            <p className="text-gray-500 leading-relaxed font-light">
              Deploy with the swiftness of Solana's high-performance architecture
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group text-center">
            <div className="mb-6">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-6"></div>
              <h3 className="font-luxury text-2xl font-semibold text-gray-200 mb-4">Impeccable Security</h3>
            </div>
            <p className="text-gray-500 leading-relaxed font-light">
              Fortified by audited SPL standards and cryptographic excellence
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group text-center">
            <div className="mb-6">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-6"></div>
              <h3 className="font-luxury text-2xl font-semibold text-gray-200 mb-4">Refined Simplicity</h3>
            </div>
            <p className="text-gray-500 leading-relaxed font-light">
              Intuitive creation process requiring no technical expertise
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group text-center">
            <div className="mb-6">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-6"></div>
              <h3 className="font-luxury text-2xl font-semibold text-gray-200 mb-4">Cost Efficient</h3>
            </div>
            <p className="text-gray-500 leading-relaxed font-light">
              Minimal transaction costs befitting blockchain sophistication
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group text-center">
            <div className="mb-6">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-6"></div>
              <h3 className="font-luxury text-2xl font-semibold text-gray-200 mb-4">Absolute Authority</h3>
            </div>
            <p className="text-gray-500 leading-relaxed font-light">
              Complete ownership and control with full minting privileges
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group text-center">
            <div className="mb-6">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-yellow-600/50 to-transparent mx-auto mb-6"></div>
              <h3 className="font-luxury text-2xl font-semibold text-gray-200 mb-4">Immediate Liquidity</h3>
            </div>
            <p className="text-gray-500 leading-relaxed font-light">
              Live deployment with instant exchange accessibility
            </p>
          </div>
        </div>
      </div>

      {/* Referral Program Section */}
      <div className="max-w-7xl mx-auto px-4 py-32 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-luxury text-5xl md:text-6xl font-bold gold-text mb-6">
              Referral Rewards
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mb-6"></div>
            <p className="font-elegant text-xl text-gray-400 max-w-2xl mx-auto">
              Share the elegance, earn rewards
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Referrers */}
            <div className="border border-yellow-600/20 bg-black/40 p-8">
              <div className="text-center mb-6">
                <div className="inline-block border border-yellow-600/30 px-4 py-2 mb-4">
                  <span className="text-yellow-600 text-xs tracking-[0.3em] uppercase">For Referrers</span>
                </div>
                <h3 className="font-luxury text-3xl font-semibold gold-text mb-4">
                  Earn Rebates
                </h3>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-gray-300">Get <span className="text-yellow-600 font-semibold">0.05 SOL</span> for each successful referral</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-gray-300">Rebates paid <span className="text-yellow-600 font-semibold">instantly</span> on-chain</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-gray-300"><span className="text-yellow-600 font-semibold">No limits</span> on referrals or earnings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-gray-300">Track your earnings in real-time</span>
                </li>
              </ul>
              <div className="text-center pt-4 border-t border-yellow-600/20">
                <div className="text-2xl font-luxury gold-text">0.05 SOL</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Per Referral</div>
              </div>
            </div>

            {/* For Referred Users */}
            <div className="border border-yellow-600/20 bg-black/40 p-8">
              <div className="text-center mb-6">
                <div className="inline-block border border-yellow-600/30 px-4 py-2 mb-4">
                  <span className="text-yellow-600 text-xs tracking-[0.3em] uppercase">For New Users</span>
                </div>
                <h3 className="font-luxury text-3xl font-semibold gold-text mb-4">
                  Save Instantly
                </h3>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-gray-300">Save <span className="text-yellow-600 font-semibold">0.1 SOL</span> on any transaction</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-gray-300">Works on <span className="text-yellow-600 font-semibold">all services</span> (Create, Lock, Burn)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-gray-300">Discount <span className="text-yellow-600 font-semibold">automatically applied</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-gray-300">Simple one-time code entry</span>
                </li>
              </ul>
              <div className="text-center pt-4 border-t border-yellow-600/20">
                <div className="text-2xl font-luxury gold-text">-0.1 SOL</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Instant Discount</div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center bg-yellow-600/5 border border-yellow-600/20 p-8">
            <p className="text-gray-300 text-lg font-elegant mb-4">
              Connect your wallet to generate your referral code
            </p>
            <p className="text-gray-500 text-sm">
              All transactions are secured on-chain with Anchor smart contracts
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-32 border-t border-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="border border-yellow-600/20 rounded-none p-16 md:p-20 bg-linear-to-b from-yellow-600/5 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer"></div>
            <div className="relative z-10">
              <h2 className="font-luxury text-4xl md:text-6xl font-bold gold-text mb-6 leading-tight">
                Begin Your Journey
              </h2>
              <div className="w-24 h-px bg-linear-to-r from-transparent via-yellow-600 to-transparent mx-auto mb-8"></div>
              <p className="font-elegant text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join the elite collective of creators establishing their legacy on Solana
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/create"
                  className="inline-block border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black font-semibold px-12 py-4 transition-all duration-300 uppercase tracking-widest text-sm"
                >
                  Create Token
                </Link>
                <Link
                  href="/locker"
                  className="inline-block border-2 border-yellow-600/50 text-yellow-600/80 hover:border-yellow-600 hover:text-yellow-600 font-semibold px-12 py-4 transition-all duration-300 uppercase tracking-widest text-sm"
                >
                  Lock Tokens
                </Link>
                <Link
                  href="/burn"
                  className="inline-block border-2 border-yellow-600/50 text-yellow-600/80 hover:border-yellow-600 hover:text-yellow-600 font-semibold px-12 py-4 transition-all duration-300 uppercase tracking-widest text-sm"
                >
                  Burn Tokens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}