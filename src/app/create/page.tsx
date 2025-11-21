"use client";

import CreateTokenForm from "@/components/CreateTokenForm";

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block border-t border-b border-yellow-600/30 py-3 px-8 mb-8">
            <span className="text-yellow-600 text-xs tracking-[0.3em] uppercase font-light">Token Creation</span>
          </div>
          
          <h1 className="font-luxury text-5xl md:text-7xl font-bold mb-6 gold-text">
            Craft Your Token
          </h1>
          
          <p className="font-elegant text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Define the parameters of your digital asset with precision and care
          </p>
        </div>

        {/* Process Steps - Minimal */}
        <div className="mb-16 animate-slideUp">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center flex-1 max-w-xs">
              <div className="w-12 h-12 border-2 border-yellow-600 text-yellow-600 flex items-center justify-center font-luxury text-xl mx-auto mb-3">
                I
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-light">Configure</p>
            </div>
            
            <div className="w-16 h-px bg-gradient-to-r from-yellow-600/50 to-transparent"></div>
            
            <div className="text-center flex-1 max-w-xs">
              <div className="w-12 h-12 border-2 border-gray-700 text-gray-600 flex items-center justify-center font-luxury text-xl mx-auto mb-3">
                II
              </div>
              <p className="text-sm text-gray-600 uppercase tracking-wider font-light">Deploy</p>
            </div>
            
            <div className="w-16 h-px bg-gray-800"></div>
            
            <div className="text-center flex-1 max-w-xs">
              <div className="w-12 h-12 border-2 border-gray-700 text-gray-600 flex items-center justify-center font-luxury text-xl mx-auto mb-3">
                III
              </div>
              <p className="text-sm text-gray-600 uppercase tracking-wider font-light">Complete</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="border border-yellow-600/20 bg-gradient-to-b from-yellow-600/5 to-transparent p-10 md:p-12 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <CreateTokenForm />
        </div>

        {/* Info Note */}
        <div className="mt-12 text-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="inline-block border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-light">Service Fee</p>
            <p className="font-elegant text-lg text-gray-400">0.6 SOL per token creation (0.5 SOL with referral)</p>
          </div>
        </div>
      </div>
    </div>
  );
}