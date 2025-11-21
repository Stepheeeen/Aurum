"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

// Dynamically import WalletMultiButton with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function ConnectWalletButton() {
  const styles = useMemo(() => `
    .wallet-adapter-button {
      background-color: transparent !important;
      border: 1px solid rgba(212, 175, 55, 0.3) !important;
      color: #d4af37 !important;
      font-family: 'Montserrat', sans-serif !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      letter-spacing: 0.15em !important;
      text-transform: uppercase !important;
      padding: 12px 24px !important;
      border-radius: 0 !important;
      transition: all 0.3s ease !important;
    }
    
    .wallet-adapter-button:not([disabled]):hover {
      background-color: #d4af37 !important;
      color: #000000 !important;
      border-color: #d4af37 !important;
    }
    
    .wallet-adapter-button-trigger {
      background-color: transparent !important;
    }

    /* Dropdown menu for connected wallet (Change Wallet, Disconnect) */
    .wallet-adapter-dropdown {
      background-color: #0a0a0a !important;
      border: 1px solid rgba(212, 175, 55, 0.2) !important;
      border-radius: 0 !important;
    }

    .wallet-adapter-dropdown-list {
      background-color: #0a0a0a !important;
    }

    .wallet-adapter-dropdown-list-item {
      background-color: transparent !important;
      color: #d4af37 !important;
      font-family: 'Montserrat', sans-serif !important;
    }

    .wallet-adapter-dropdown-list-item:hover {
      background-color: rgba(212, 175, 55, 0.1) !important;
    }

    /* Modal styling for wallet selection */
    .wallet-adapter-modal-wrapper {
      background-color: rgba(0, 0, 0, 0.9) !important;
      backdrop-filter: blur(8px) !important;
    }

    .wallet-adapter-modal {
      background-color: #0a0a0a !important;
      border: 1px solid rgba(212, 175, 55, 0.3) !important;
      border-radius: 0 !important;
      box-shadow: 0 8px 32px rgba(212, 175, 55, 0.15) !important;
      max-width: 500px !important;
    }

    .wallet-adapter-modal-title {
      color: #d4af37 !important;
      font-family: 'Playfair Display', serif !important;
      font-size: 24px !important;
      font-weight: 600 !important;
      letter-spacing: 0.05em !important;
      text-align: center !important;
    }

    .wallet-adapter-modal-list {
      background-color: #0a0a0a !important;
      padding: 20px !important;
    }

    /* Individual wallet buttons in modal */
    .wallet-adapter-modal-list .wallet-adapter-button {
      background-color: transparent !important;
      border: 1px solid rgba(212, 175, 55, 0.2) !important;
      color: #d4af37 !important;
      font-family: 'Montserrat', sans-serif !important;
      font-size: 12px !important;
      letter-spacing: 0.1em !important;
      text-transform: uppercase !important;
      padding: 16px 20px !important;
      margin-bottom: 12px !important;
      border-radius: 0 !important;
      justify-content: flex-start !important;
      width: 100% !important;
    }

    .wallet-adapter-modal-list .wallet-adapter-button:hover {
      background-color: rgba(212, 175, 55, 0.1) !important;
      border-color: #d4af37 !important;
    }

    .wallet-adapter-modal-list .wallet-adapter-button-start-icon {
      margin-right: 16px !important;
    }

    /* Close button */
    .wallet-adapter-modal-button-close {
      background-color: transparent !important;
      color: #d4af37 !important;
      border: 1px solid rgba(212, 175, 55, 0.3) !important;
      border-radius: 0 !important;
      padding: 8px !important;
    }

    .wallet-adapter-modal-button-close:hover {
      background-color: rgba(212, 175, 55, 0.1) !important;
    }

    .wallet-adapter-modal-button-close svg {
      width: 18px !important;
      height: 18px !important;
    }

    /* Footer links */
    .wallet-adapter-modal-middle {
      color: #666 !important;
      font-family: 'Montserrat', sans-serif !important;
      font-size: 11px !important;
      letter-spacing: 0.1em !important;
      text-transform: uppercase !important;
      text-align: center !important;
      padding: 20px !important;
    }

    .wallet-adapter-modal-middle a {
      color: #d4af37 !important;
      text-decoration: none !important;
    }

    .wallet-adapter-modal-middle a:hover {
      color: #f4e4b0 !important;
    }

    /* Collapse button for "More options" */
    .wallet-adapter-modal-list-more {
      background-color: transparent !important;
      border-top: 1px solid rgba(212, 175, 55, 0.2) !important;
      padding-top: 12px !important;
      margin-top: 8px !important;
    }

    .wallet-adapter-modal-list-more .wallet-adapter-button {
      border: none !important;
      padding: 12px 20px !important;
    }

    .wallet-adapter-modal-list-more .wallet-adapter-button:hover {
      background-color: rgba(212, 175, 55, 0.05) !important;
    }
  `, []);

  return (
    <div className="wallet-button-wrapper">
      <style jsx global>{styles}</style>
      <WalletMultiButtonDynamic />
    </div>
  );
}
