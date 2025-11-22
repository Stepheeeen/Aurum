"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { createMintBasic } from "@/lib/solana";
import { EXPLORER_CLUSTER_SUFFIX } from "@/lib/config";

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  supply: number;
  decimals: number;
  
}

export default function CreateTokenForm() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    description: "",
    supply: 1000000,
    decimals: 9,
    
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });
  const [txSignature, setTxSignature] = useState("");
  const [mintAddress, setMintAddress] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "supply" || name === "decimals" ? Number(value) : value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) {
      setStatus({ type: "error", message: "Please connect your wallet first" });
      return;
    }

    if (!formData.name || !formData.symbol) {
      setStatus({ type: "error", message: "Token name and symbol are required" });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });
    setMintAddress("");
    setTxSignature("");

    try {
      const res = await createMintBasic({
        wallet: { publicKey, signTransaction, sendTransaction },
        supply: formData.supply,
        decimals: formData.decimals,
      });
      setMintAddress(res.mint);
      setTxSignature("(mint txn embedded)");
      setStatus({ type: "success", message: "Token created successfully" });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to create token. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Token Name */}
      <div className="form-group">
        <label htmlFor="name" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
          Token Name <span className="text-yellow-600">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="e.g., Prestige Gold"
          value={formData.name}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-lg"
        />
      </div>

      {/* Token Symbol */}
      <div className="form-group">
        <label htmlFor="symbol" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
          Token Symbol <span className="text-yellow-600">*</span>
        </label>
        <input
          type="text"
          id="symbol"
          name="symbol"
          placeholder="e.g., PGLD"
          value={formData.symbol}
          onChange={handleInputChange}
          required
          maxLength={10}
          disabled={isLoading}
          className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 uppercase disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-lg"
        />
        <p className="text-xs text-gray-600 mt-2 font-light tracking-wide">Maximum 10 characters</p>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="A distinguished digital asset..."
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          disabled={isLoading}
          className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed font-light leading-relaxed"
        />
      </div>

      {/* Supply and Decimals Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="supply" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
            Initial Supply
          </label>
          <input
            type="number"
            id="supply"
            name="supply"
            placeholder="1000000"
            value={formData.supply}
            onChange={handleInputChange}
            min={1}
            disabled={isLoading}
            className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-lg"
          />
          <p className="text-xs text-gray-600 mt-2 font-light tracking-wide">Raw units (no decimals applied yet). For 9 decimals, real token amount = supply / 10^9.</p>
        </div>

        <div className="form-group">
          <label htmlFor="decimals" className="block text-sm font-light tracking-wider uppercase text-gray-500 mb-3">
            Decimals
          </label>
          <input
            type="number"
            id="decimals"
            name="decimals"
            value={formData.decimals}
            onChange={handleInputChange}
            min={0}
            max={9}
            disabled={isLoading}
            className="w-full px-6 py-4 bg-black border border-gray-800 text-gray-200 focus:border-yellow-600 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-lg"
          />
          <p className="text-xs text-gray-600 mt-2 font-light tracking-wide">Common: 6 or 9. Display supply = raw / 10^decimals.</p>
        </div>
      </div>

      {/* Referral removed in minimal mode */}

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
          "Create Token"
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
      {mintAddress && (
        <div className="border-2 border-yellow-600/30 bg-yellow-600/5 p-8 space-y-6 animate-slideIn mt-8">
          <h3 className="font-luxury text-2xl font-semibold gold-text text-center mb-6">
            Token Successfully Created
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Mint Address</p>
              <div className="bg-black border border-gray-800 p-4 break-all text-sm font-mono text-gray-400">
                {mintAddress}
              </div>
              <a
                href={`https://explorer.solana.com/address/${mintAddress}${EXPLORER_CLUSTER_SUFFIX}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow-600 hover:text-yellow-500 mt-2 inline-block transition-colors tracking-wide"
              >
                View on Solana Explorer →
              </a>
            </div>

            {txSignature && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-light">Transaction Signature</p>
                <div className="bg-black border border-gray-800 p-4 break-all text-sm font-mono text-gray-400">
                  {txSignature}
                </div>
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}${EXPLORER_CLUSTER_SUFFIX}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-600 hover:text-yellow-500 mt-2 inline-block transition-colors tracking-wide"
                >
                  View Transaction →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}