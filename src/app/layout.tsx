import WalletProvider from "@/components/WalletProvider";
import Link from "next/link";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import "./globals.css";

export const metadata = {
  title: "AURUM - Solana Token Atelier",
  description: "Craft bespoke digital assets with unparalleled elegance on Solana blockchain"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
      </head>
      <body>
        <WalletProvider>
          {/* Navigation Header */}
          <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-4">
                  {/* <div className="w-10 h-10 border border-yellow-600/50 flex items-center justify-center transition-colors duration-300 group-hover:border-yellow-600">
                    <span className="text-yellow-600 font-luxury text-xl">A</span>
                  </div> */}
                  <div>
                    <span className="font-luxury text-2xl gold-text block leading-none">
                      AURUM
                    </span>
                    <span className="text-xs text-gray-600 uppercase tracking-widest font-light">
                      Token Atelier
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-6">
                  <Link
                    href="/create"
                    className="hidden sm:block text-gray-400 hover:text-yellow-600 font-light transition-colors duration-300 uppercase tracking-widest text-xs"
                  >
                    Create
                  </Link>
                  <Link
                    href="/locker"
                    className="hidden sm:block text-gray-400 hover:text-yellow-600 font-light transition-colors duration-300 uppercase tracking-widest text-xs"
                  >
                    Locker
                  </Link>
                  <Link
                    href="/burn"
                    className="hidden sm:block text-gray-400 hover:text-yellow-600 font-light transition-colors duration-300 uppercase tracking-widest text-xs"
                  >
                    Burn
                  </Link>
                  <ConnectWalletButton />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-black border-t border-gray-900 py-12 mt-32">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center">
                <div className="font-luxury text-3xl gold-text mb-4">AURUM</div>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mb-6"></div>
                <p className="text-gray-600 text-xs uppercase tracking-widest mb-2 font-light">
                  Built on Solana • SPL Token Standard
                </p>
                <p className="text-gray-700 text-xs mt-4 font-light">
                  © 2025 AURUM. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}