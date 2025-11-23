'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { RPC_URL } from '@/lib/config';

// Local fallback types and helpers (replace with real implementations from /lib/pricing if/when available)
type ReferralAccountData = {
  code: string;
  totalReferrals: number;
  rebateEarned: number; // in lamports
};

const lamportsToSOL = (lamports: number) => Number((lamports / 1e9).toFixed(3));

const generateReferralLink = (code: string) => {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/?ref=${encodeURIComponent(code)}`;
  }
  return `/?ref=${encodeURIComponent(code)}`;
};

const fetchReferralAccount = async (_connection: Connection, publicKey: PublicKey): Promise<ReferralAccountData> => {
  // Minimal client-side fallback: generate a code from the public key and zeroed stats.
  // Replace with actual on-chain lookup logic when integrating the proper pricing/referral library.
  const code = publicKey.toBase58().slice(0, 8);
  return {
    code,
    totalReferrals: 0,
    rebateEarned: 0,
  };
};

export default function ReferralBox() {
  const { publicKey, connected } = useWallet();
  const [referralData, setReferralData] = useState<ReferralAccountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      loadReferralData();
    } else {
      setReferralData(null);
    }
  }, [connected, publicKey]);

  const loadReferralData = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const connection = new Connection(RPC_URL);
      const data = await fetchReferralAccount(connection, publicKey);
      setReferralData(data);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralData) return;
    
    const link = generateReferralLink(referralData.code);
    navigator.clipboard.writeText(link);
    setCopied(true);
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected || !publicKey) {
    return (
      <div className="bg-charcoal border border-gold/20 rounded p-6">
        <h3 className="text-xl font-serif text-gold mb-4">Referral Program</h3>
        <p className="text-cream/60 text-sm">
          Connect your wallet to access your referral code and earn rebates.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-charcoal border border-gold/20 rounded p-6">
        <h3 className="text-xl font-serif text-gold mb-4">Referral Program</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="bg-charcoal border border-gold/20 rounded p-6">
        <h3 className="text-xl font-serif text-gold mb-4">Referral Program</h3>
        <p className="text-cream/60 text-sm mb-4">
          Create your referral account to start earning rebates.
        </p>
        <button
          onClick={loadReferralData}
          className="w-full bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 px-6 py-3 rounded transition-all"
        >
          Create Referral Account
        </button>
      </div>
    );
  }

  const referralLink = generateReferralLink(referralData.code);

  return (
    <div className="bg-charcoal border border-gold/20 rounded p-6">
      <h3 className="text-xl font-serif text-gold mb-6">Your Referral Dashboard</h3>
      
      {/* Referral Code */}
      <div className="mb-6">
        <label className="block text-sm text-cream/60 mb-2">Referral Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralData.code}
            readOnly
            className="flex-1 bg-black/40 border border-gold/30 text-gold px-4 py-3 rounded font-mono text-lg"
          />
          <button
            onClick={copyReferralLink}
            className="bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 px-6 py-3 rounded transition-all whitespace-nowrap"
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className="text-cream/40 text-xs mt-2">
          Share this link to earn 0.05 SOL per referral
        </p>
      </div>

      {/* Referral Link */}
      <div className="mb-6">
        <label className="block text-sm text-cream/60 mb-2">Your Referral Link</label>
        <div className="bg-black/40 border border-gold/20 rounded p-3 break-all text-cream/80 text-sm">
          {referralLink}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 border border-gold/20 rounded p-4">
          <div className="text-cream/60 text-sm mb-1">Total Referrals</div>
          <div className="text-2xl font-serif text-gold">
            {referralData.totalReferrals}
          </div>
        </div>
        <div className="bg-black/40 border border-gold/20 rounded p-4">
          <div className="text-cream/60 text-sm mb-1">Rebates Earned</div>
          <div className="text-2xl font-serif text-gold">
            {lamportsToSOL(referralData.rebateEarned)} SOL
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-6 bg-gold/5 border border-gold/20 rounded p-4">
        <h4 className="text-sm font-semibold text-gold mb-2">How It Works</h4>
        <ul className="text-cream/70 text-xs space-y-1">
          <li>• Your referrals save 0.1 SOL on any transaction</li>
          <li>• You earn 0.05 SOL rebate for each referral</li>
          <li>• Rebates are paid instantly on-chain</li>
          <li>• No limits on referrals or earnings</li>
        </ul>
      </div>
    </div>
  );
}
