"use client";
import { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { NETWORK, RPC_URL } from "@/lib/config";

export default function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const network: WalletAdapterNetwork =
    NETWORK === 'mainnet' ? WalletAdapterNetwork.Mainnet :
    NETWORK === 'testnet' ? WalletAdapterNetwork.Testnet :
    WalletAdapterNetwork.Devnet;

  const endpoint = RPC_URL;
  
  // Include multiple wallet adapters - the modal will auto-detect installed wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // The wallet adapter automatically detects other wallets like:
      // - Solflare, Backpack, Glow, Coinbase Wallet, Trust Wallet, etc.
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
