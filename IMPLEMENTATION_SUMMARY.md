# AURUM - Solana Token Atelier
## Hybrid Pricing Implementation Summary

### 🎯 Project Overview
AURUM is a luxury-themed Solana token creation platform with on-chain fee enforcement and a referral rewards system.

---

## ✅ Completed Features

### 1. **Luxury UI/UX**
- **Theme**: Gold (#d4af37) & Black (#0a0a0a) color scheme
- **Fonts**: 
  - Playfair Display (headings)
  - Cormorant Garamond (body text)
  - Montserrat (UI elements)
- **Brand**: AURUM - Solana Token Atelier
- **Design**: Minimal, elegant, border-only components

### 2. **Pages**
- ✅ **Home Page** (`/`)
  - Hero section with hybrid pricing display
  - Statistics showcase
  - Feature grid
  - Referral program section
  - Multi-button CTA
  
- ✅ **Create Token Page** (`/create`)
  - Detailed form (name, symbol, description, supply, decimals)
  - Fee display with strikethrough premium price
  - Success modal with Solana Explorer links
  
- ✅ **Locker Page** (`/locker`)
  - Token locking with time-lock
  - Unlock date/time picker
  - Countdown timer
  - Escrow account creation
  - 1 SOL fee → 0.3 SOL (Anchor)
  
- ✅ **Burn Page** (`/burn`)
  - Token burning functionality
  - Warning banners
  - Remaining balance display
  - Social share integration
  - 0.5 SOL fee → 0.15 SOL (Anchor)

### 3. **Wallet Integration**
- ✅ Multi-wallet support (Phantom, Solflare, etc.)
- ✅ Wallet switching modal
- ✅ SSR-compatible (Next.js dynamic import)
- ✅ Luxury-themed wallet UI

### 4. **Anchor Smart Contract** ⚠️ (Needs Deployment)
- ✅ **Program Structure**: Complete Rust implementation
- ✅ **Instructions**:
  - `initialize_config` - Set up program
  - `update_pricing` - Admin pricing control
  - `create_referral` - Generate referral codes
  - `create_token` - Token creation with fee enforcement
  - `lock_tokens` - Escrow with time-lock
  - `burn_tokens` - Permanent token burning
  - `withdraw_fees` - Admin withdrawal
  
- ✅ **PDAs**:
  - Config (pricing configuration)
  - Treasury (fee collection)
  - ReferralAccount (per-user referrals)
  
- ✅ **Events**:
  - FeeCollected
  - ReferralUsed
  - TokenCreated
  - TokensLocked
  - TokensBurned
  - FeesWithdrawn

### 5. **Referral System**
- ✅ On-chain referral tracking
- ✅ 8-character referral codes (derived from pubkey)
- ✅ Instant rebate payments
- ✅ ReferralBox component (not yet integrated)
- ✅ Pricing helper functions

### 6. **Fee Structure**

| Operation | Premium | Base | With Referral | Referrer Rebate |
|-----------|---------|------|---------------|-----------------|
| Create    | 1.2 SOL | 0.6 SOL | 0.5 SOL    | 0.05 SOL       |
| Lock      | 0.6 SOL | 0.3 SOL | 0.2 SOL    | 0.05 SOL       |
| Burn      | 0.3 SOL | 0.15 SOL | 0.05 SOL  | 0.05 SOL       |

**Psychological Pricing**: Display crossed-out premium price to show value

---

## 🔄 In Progress / Pending

### Anchor Deployment
The Anchor program is complete but not yet deployed:
1. Need to install Rust + Solana CLI + Anchor CLI
2. Build program (`anchor build`)
3. Deploy to devnet/mainnet
4. Initialize config account

**Script provided**: `./scripts/setup-anchor.sh`

### Frontend Integration
Once program is deployed:
1. Update program IDs in:
   - `programs/aurum-hybrid-pricing/src/lib.rs`
   - `Anchor.toml`
   - `src/lib/pricing.ts`
2. Install `@coral-xyz/anchor` dependency
3. Update form components to use Anchor instructions
4. Add referral code input fields
5. Integrate ReferralBox component

---

## 📁 File Structure

```
/programs/aurum-hybrid-pricing/
  ├── Cargo.toml                 ✅ Package definition
  ├── README.md                  ✅ Program documentation
  └── src/
      ├── lib.rs                 ✅ Main program logic
      ├── constants.rs           ✅ Fee constants
      ├── state.rs               ✅ Account structures
      ├── errors.rs              ✅ Error definitions
      └── events.rs              ✅ Event definitions

/src/
  ├── app/
  │   ├── page.tsx               ✅ Home with pricing
  │   ├── layout.tsx             ✅ Navigation header
  │   ├── globals.css            ✅ Luxury theme
  │   ├── create/page.tsx        ✅ Token creation
  │   ├── locker/page.tsx        ✅ Token locking
  │   └── burn/page.tsx          ✅ Token burning
  ├── components/
  │   ├── CreateTokenForm.tsx    ✅ Creation form
  │   ├── LockerForm.tsx         ✅ Locking form
  │   ├── BurnForm.tsx           ✅ Burning form
  │   ├── WalletProvider.tsx     ✅ Wallet adapter
  │   ├── ConnectWalletButton.tsx ✅ Connect button
  │   └── ReferralBox.tsx        ✅ Referral dashboard
  └── lib/
      ├── solana.ts              ✅ Helper functions
      ├── pricing.ts             ✅ Anchor integration
      └── config.ts              ✅ Configuration

/scripts/
  └── setup-anchor.sh            ✅ Auto-setup script

Anchor.toml                      ✅ Anchor config
INTEGRATION_GUIDE.md             ✅ Step-by-step guide
```

---

## 🚀 Quick Start

### For Development (Without Anchor)
Current frontend works with client-side fee validation:
```bash
npm install
npm run dev
```
Open http://localhost:3000

### For Full Anchor Integration
Follow `INTEGRATION_GUIDE.md`:
```bash
# 1. Install dependencies
./scripts/setup-anchor.sh

# 2. Build Anchor program
anchor build

# 3. Update program IDs (see guide)

# 4. Deploy
anchor deploy

# 5. Initialize
npx ts-node scripts/initialize.ts

# 6. Update frontend components (see guide)

# 7. Install Anchor in frontend
npm install @coral-xyz/anchor

# 8. Test
npm run dev
```

---

## 🎨 Design Highlights

### Color Palette
- **Gold**: #d4af37 (primary), #f4e4b0 (light), #9a7b2a (dark)
- **Black**: #0a0a0a (background)
- **Charcoal**: #1a1a1a (cards)
- **Cream**: #faf8f3 (text highlights)

### Typography
- **Headings**: Playfair Display (serif, luxury)
- **Body**: Cormorant Garamond (elegant)
- **UI**: Montserrat (modern sans-serif)

### Animations
- Fade in
- Slide up
- Shimmer effect
- Smooth transitions

---

## 💡 Key Features

### Hybrid Pricing Psychology
Display premium "anchor" price with strikethrough to show value:
- **Shows**: ~~1.2 SOL~~ **0.6 SOL**
- **Perception**: 50% discount
- **Reality**: Fair market rate
- **With referral**: Additional 0.1 SOL off

### On-Chain Referral System
- Generate 8-char code from wallet pubkey
- Share referral link with code
- Users save 0.1 SOL per transaction
- Referrers earn 0.05 SOL instantly
- All tracked on-chain via Anchor
- No limits on referrals

### Security
- On-chain fee enforcement (no frontend bypass)
- PDA-based access control
- Checked arithmetic (no overflow)
- Admin-only functions protected
- Event logging for transparency

---

## 📊 Current State

### Working (Without Anchor)
- ✅ All pages render correctly
- ✅ Wallet connection works
- ✅ Forms validate input
- ✅ Client-side fee enforcement
- ✅ Luxury theme consistent
- ✅ Mobile responsive

### Needs Anchor Deployment
- ⚠️ On-chain fee enforcement
- ⚠️ Referral code generation
- ⚠️ Rebate payments
- ⚠️ Admin fee withdrawal
- ⚠️ Event emission
- ⚠️ Treasury management

---

## 📝 Next Steps

### Immediate
1. Install Rust/Solana/Anchor (use setup script)
2. Build Anchor program
3. Deploy to devnet
4. Test all instructions
5. Update frontend integration

### Frontend Updates
1. Add `@coral-xyz/anchor` dependency
2. Update CreateTokenForm.tsx
3. Update LockerForm.tsx
4. Update BurnForm.tsx
5. Add referral input fields
6. Integrate ReferralBox component
7. Add pricing display from on-chain

### Testing
1. Test on devnet thoroughly
2. Verify referral system
3. Test all edge cases
4. Security audit (recommended)
5. Deploy to mainnet

### Marketing
1. Highlight hybrid pricing
2. Promote referral program
3. Emphasize luxury brand
4. Showcase on-chain security

---

## 🎯 Value Proposition

**For Users**:
- Elegant, easy-to-use interface
- Fair, transparent pricing
- Referral discounts available
- On-chain security guarantees
- Instant deployment (<60 seconds)

**For Referrers**:
- Earn 0.05 SOL per referral
- Unlimited earning potential
- Instant on-chain rebates
- Easy link sharing
- Real-time stats tracking

**For Platform**:
- Sustainable fee structure
- Viral referral growth
- Premium brand positioning
- On-chain transparency
- Scalable architecture

---

## 📚 Documentation

- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Anchor README**: `programs/aurum-hybrid-pricing/README.md`
- **Setup Script**: `scripts/setup-anchor.sh`

---

## 🔗 Links

- **Solana Docs**: https://docs.solana.com/
- **Anchor Docs**: https://www.anchor-lang.com/
- **SPL Token**: https://spl.solana.com/token
- **Wallet Adapter**: https://github.com/solana-labs/wallet-adapter

---

## 💎 Brand Essence

**AURUM** = Latin for "gold"
- Premium positioning
- Timeless elegance
- Sophisticated simplicity
- Trust through transparency
- Excellence by design

---

*Built with precision. Designed for prestige.*
