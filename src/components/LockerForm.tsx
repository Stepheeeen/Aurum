"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { lockTokensWithFee } from "@/lib/solana";
import { EXPLORER_CLUSTER_SUFFIX } from "@/lib/config";

interface LockerFormData {
  mintAddress: string;
  amount: number;
  unlockDate: string;
  unlockTime: string;
}

export default function LockerForm() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [formData, setFormData] = useState<LockerFormData>({
    mintAddress: "",
    amount: 0,
    unlockDate: "",
    unlockTime: "12:00",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });
  const [lockResult, setLockResult] = useState<{
    escrowAddress: string;
    unlockTimestamp: number;
    amount: number;
    feeSig: string;
    lockSig: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) {
      setStatus({ type: "error", message: "Please connect your wallet first" });
      return;
    }

    if (!formData.mintAddress || !formData.amount || !formData.unlockDate) {
      setStatus({ type: "error", message: "All fields are required" });
      return;
    }

    // Combine date and time
    const unlockDateTime = new Date(`${formData.unlockDate}T${formData.unlockTime}`);
    if (unlockDateTime <= new Date()) {
      setStatus({ type: "error", message: "Unlock date must be in the future" });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });
    setLockResult(null);

    try {
      const res = await lockTokensWithFee({
        wallet: { publicKey, signTransaction, sendTransaction },
        mintAddress: formData.mintAddress,
        amount: formData.amount,
        unlockDate: unlockDateTime,
      });

      setLockResult(res);
      setStatus({
        type: "success",
        message: "Tokens locked successfully",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to lock tokens. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate countdown
  const getCountdown = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) return "Unlocked";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Token Mint Address */}
      <div className="form-group">
        <label htmlFor="mintAddress" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
          Token Mint Address <span className="text-yellow-600">*</span>
        </label>
        <input
          type="text"
          id="mintAddress"
          name="mintAddress"
          placeholder="Enter token mint address..."
          value={formData.mintAddress}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
        />
      </div>

      {/* Amount to Lock */}
      <div className="form-group">
        <label htmlFor="amount" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
          Amount to Lock <span className="text-yellow-600">*</span>
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          placeholder="0"
          value={formData.amount || ""}
          onChange={handleInputChange}
          required
          min={1}
          step="any"
          disabled={isLoading}
          className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-lg"
        />
      </div>

      {/* Unlock Date and Time */}
      <div className="grid grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="unlockDate" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
            Unlock Date <span className="text-yellow-600">*</span>
          </label>
          <input
            type="date"
            id="unlockDate"
            name="unlockDate"
            value={formData.unlockDate}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]}
            disabled={isLoading}
            className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="form-group">
          <label htmlFor="unlockTime" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
            Unlock Time <span className="text-yellow-600">*</span>
          </label>
          <input
            type="time"
            id="unlockTime"
            name="unlockTime"
            value={formData.unlockTime}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Fee Info */}
      <div className="border border-yellow-600/20 bg-yellow-600/5 p-6">
        <p className="text-sm text-gray-400 text-center font-light">
          <span className="text-yellow-600 font-semibold">Service Fee:</span> 0.3 SOL (0.2 SOL with referral)
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !publicKey}
        className="w-full relative bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black font-semibold py-5 px-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-yellow-600 uppercase tracking-widest text-sm overflow-hidden group mt-12"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></span>
            Processing...
          </span>
        ) : !publicKey ? (
          "Connect Wallet First"
        ) : (
          "Lock Tokens"
        )}
      </button>

      {/* Status Messages */}
      {status.message && (
        <div
          className={`p-6 border ${
            status.type === "success"
              ? "bg-yellow-600/5 border-yellow-600/30 text-gray-300"
              : "bg-red-900/10 border-red-900/30 text-red-400"
          } animate-slideIn mt-8`}
        >
          <p className="font-elegant text-lg text-center">{status.message}</p>
        </div>
      )}

      {/* Success Details */}
      {lockResult && (
        <div className="border-2 border-yellow-600/30 bg-yellow-600/5 p-8 space-y-6 animate-slideIn mt-8">
          <h3 className="font-luxury text-2xl font-semibold gold-text text-center mb-6">
            Tokens Locked Successfully
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Locked Amount</p>
              <div className="bg-black border border-gray-800 p-4 text-xl font-elegant text-yellow-600">
                {lockResult.amount.toLocaleString()} tokens
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Escrow Address</p>
              <div className="bg-black border border-gray-800 p-4 break-all text-sm font-mono text-gray-400">
                {lockResult.escrowAddress}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Unlock Date</p>
              <div className="bg-black border border-gray-800 p-4 text-gray-300 font-elegant">
                {new Date(lockResult.unlockTimestamp).toLocaleString()}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Time Remaining</p>
              <div className="bg-black border border-gray-800 p-4 text-2xl font-luxury text-yellow-600 text-center">
                {getCountdown(lockResult.unlockTimestamp)}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Transaction Signature</p>
              <div className="bg-black border border-gray-800 p-4 break-all text-sm font-mono text-gray-400">
                {lockResult.lockSig}
              </div>
              <a
                href={`https://explorer.solana.com/tx/${lockResult.lockSig}${EXPLORER_CLUSTER_SUFFIX}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow-600 hover:text-yellow-500 mt-2 inline-block transition-colors tracking-wide"
              >
                View on Solana Explorer →
              </a>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
