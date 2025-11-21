"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { burnTokensWithFee } from "@/lib/solana";

interface BurnFormData {
  mintAddress: string;
  amount: number;
}

export default function BurnForm() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [formData, setFormData] = useState<BurnFormData>({
    mintAddress: "",
    amount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });
  const [burnResult, setBurnResult] = useState<{
    feeSig: string;
    burnSig: string;
    amountBurned: number;
    remainingBalance: number;
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

    if (!formData.mintAddress || !formData.amount) {
      setStatus({ type: "error", message: "All fields are required" });
      return;
    }

    if (formData.amount <= 0) {
      setStatus({ type: "error", message: "Amount must be greater than 0" });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });
    setBurnResult(null);

    try {
      const res = await burnTokensWithFee({
        wallet: { publicKey, signTransaction, sendTransaction },
        mintAddress: formData.mintAddress,
        amount: formData.amount,
      });

      setBurnResult(res);
      setStatus({
        type: "success",
        message: "Tokens burned successfully",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to burn tokens. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

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

      {/* Amount to Burn */}
      <div className="form-group">
        <label htmlFor="amount" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
          Amount to Burn <span className="text-yellow-600">*</span>
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
        <p className="text-xs text-gray-600 mt-2 font-light tracking-wide">
          Tokens will be permanently removed from circulation
        </p>
      </div>

      {/* Warning Message */}
      <div className="border border-red-900/30 bg-red-900/10 p-6">
        <p className="text-sm text-red-400 text-center font-light leading-relaxed">
          <span className="font-semibold uppercase tracking-wider">Warning:</span> This action is irreversible. Burned tokens cannot be recovered.
        </p>
      </div>

      {/* Fee Info */}
      <div className="border border-yellow-600/20 bg-yellow-600/5 p-6">
        <p className="text-sm text-gray-400 text-center font-light">
          <span className="text-yellow-600 font-semibold">Service Fee:</span> 0.5 SOL
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
          "Burn Tokens"
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
      {burnResult && (
        <div className="border-2 border-yellow-600/30 bg-yellow-600/5 p-8 space-y-6 animate-slideIn mt-8">
          <h3 className="font-luxury text-2xl font-semibold gold-text text-center mb-6">
            Tokens Burned Successfully
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Burned Amount</p>
              <div className="bg-black border border-gray-800 p-4 text-xl font-elegant text-red-400">
                {burnResult.amountBurned.toLocaleString()} tokens
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Remaining Balance</p>
              <div className="bg-black border border-gray-800 p-4 text-xl font-elegant text-yellow-600">
                {burnResult.remainingBalance.toLocaleString()} tokens
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Burn Transaction</p>
              <div className="bg-black border border-gray-800 p-4 break-all text-sm font-mono text-gray-400">
                {burnResult.burnSig}
              </div>
              <a
                href={`https://explorer.solana.com/tx/${burnResult.burnSig}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow-600 hover:text-yellow-500 mt-2 inline-block transition-colors tracking-wide"
              >
                View on Solana Explorer →
              </a>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Fee Transaction</p>
              <div className="bg-black border border-gray-800 p-4 break-all text-sm font-mono text-gray-400">
                {burnResult.feeSig}
              </div>
              <a
                href={`https://explorer.solana.com/tx/${burnResult.feeSig}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow-600 hover:text-yellow-500 mt-2 inline-block transition-colors tracking-wide"
              >
                View Fee Transaction →
              </a>
            </div>
          </div>

          {/* Social Share CTA */}
          <div className="pt-6 border-t border-gray-800 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-light">Share Your Achievement</p>
            <div className="flex gap-4 justify-center">
              <a
                href={`https://twitter.com/intent/tweet?text=Just%20burned%20${burnResult.amountBurned.toLocaleString()}%20tokens%20using%20AURUM%20Token%20Atelier!%20%F0%9F%94%A5&url=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 border border-yellow-600/30 text-yellow-600 hover:bg-yellow-600/10 transition-all text-xs uppercase tracking-wider"
              >
                Share on X
              </a>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
