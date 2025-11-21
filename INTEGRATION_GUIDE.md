# AURUM Anchor Integration Guide

## Project Status

✅ **Completed**:
- Luxury UI with AURUM branding (gold/black theme)
- Create Token page with detailed form
- Locker page with time-lock functionality
- Burn page with warnings and social share
- Wallet adapter with multi-wallet support
- Navigation and home page

🔄 **In Progress**:
- Anchor program implementation (structure complete, needs deployment)

⏳ **Pending**:
- Anchor program deployment
- Frontend integration with Anchor program
- ReferralBox component integration
- Update forms to use Anchor instructions

## Anchor Program Overview

The Anchor program is fully implemented with:
- ✅ All instructions (initialize_config, create_referral, create_token, lock_tokens, burn_tokens, withdraw_fees)
- ✅ State structs (Config, Treasury, ReferralAccount)
- ✅ Events for frontend tracking
- ✅ Error handling
- ✅ PDA derivation helpers
- ✅ Referral system with instant rebates

**Location**: `/programs/aurum-hybrid-pricing/`

## Setup Steps

### 1. Install Anchor Development Environment

```bash
# Run the automated setup script
./scripts/setup-anchor.sh

# Or manual installation:
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# 3. Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 2. Configure Solana

```bash
# Set to devnet for testing
solana config set --url devnet

# Create a keypair if needed
solana-keygen new

# Airdrop SOL for testing
solana airdrop 2
```

### 3. Build Anchor Program

```bash
cd /Users/admin/Github/solana-token-deployer

# Build the program
anchor build

# Get the program ID
anchor keys list
```

### 4. Update Program IDs

After building, update the program ID in these files:

**File 1: `programs/aurum-hybrid-pricing/src/lib.rs`**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**File 2: `Anchor.toml`**
```toml
[programs.devnet]
aurum_hybrid_pricing = "YOUR_PROGRAM_ID_HERE"
```

**File 3: `src/lib/pricing.ts`**
```typescript
export const AURUM_PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
```

### 5. Rebuild and Deploy

```bash
# Rebuild with updated program ID
anchor build

# Deploy to devnet
anchor deploy

# Verify deployment
solana program show YOUR_PROGRAM_ID
```

### 6. Initialize the Program

Create `scripts/initialize.ts`:
```typescript
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';

async function initialize() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.AurumHybridPricing as Program;
  
  const [configPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    program.programId
  );
  
  const [treasuryPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    program.programId
  );
  
  await program.methods
    .initializeConfig()
    .accounts({
      config: configPDA,
      treasury: treasuryPDA,
      owner: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log('✅ Program initialized successfully!');
  console.log('Config PDA:', configPDA.toString());
  console.log('Treasury PDA:', treasuryPDA.toString());
}

initialize();
```

Run initialization:
```bash
npx ts-node scripts/initialize.ts
```

## Frontend Integration

### 7. Install Anchor Dependencies

```bash
npm install @coral-xyz/anchor
# or
yarn add @coral-xyz/anchor
```

### 8. Update Component Files

The following files need to be updated to use Anchor:

#### **CreateTokenForm.tsx**
Replace direct fee transfer with Anchor instruction:
```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import idl from '../../target/idl/aurum_hybrid_pricing.json';

// In handleSubmit:
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, provider);

await program.methods
  .createToken(decimals, referralCode || null)
  .accounts({
    // ... accounts
  })
  .rpc();
```

#### **LockerForm.tsx**
Update to use `lock_tokens` instruction:
```typescript
await program.methods
  .lockTokens(new BN(amountLamports), unlockTimestamp, referralCode || null)
  .accounts({
    // ... accounts
  })
  .rpc();
```

#### **BurnForm.tsx**
Update to use `burn_tokens` instruction:
```typescript
await program.methods
  .burnTokens(new BN(amountLamports), referralCode || null)
  .accounts({
    // ... accounts
  })
  .rpc();
```

### 9. Add Referral Input Fields

Add to all forms:
```tsx
<div>
  <label className="block text-sm text-cream/60 mb-2">
    Referral Code (Optional)
  </label>
  <input
    type="text"
    value={referralCode}
    onChange={(e) => setReferralCode(e.target.value)}
    placeholder="Enter referral code for 0.1 SOL discount"
    className="w-full bg-black/40 border border-gold/30 text-cream px-4 py-3 rounded"
  />
  <p className="text-cream/40 text-xs mt-1">
    Save 0.1 SOL with a referral code
  </p>
</div>
```

### 10. Add ReferralBox to Pages

Add to each page (Create, Locker, Burn):
```tsx
import ReferralBox from '@/components/ReferralBox';

// In the component:
<div className="grid lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">
    {/* Existing form */}
  </div>
  <div>
    <ReferralBox />
  </div>
</div>
```

## Testing

### Unit Tests

Create `tests/aurum-hybrid-pricing.ts`:
```typescript
import * as anchor from '@coral-xyz/anchor';
import { expect } from 'chai';

describe('aurum-hybrid-pricing', () => {
  it('Initializes config', async () => {
    // Test initialization
  });
  
  it('Creates token with referral', async () => {
    // Test token creation with referral discount
  });
  
  // ... more tests
});
```

Run tests:
```bash
anchor test
```

### Frontend Testing

1. **Test referral code generation**:
   - Connect wallet
   - Check ReferralBox displays code
   - Copy link and test sharing

2. **Test token creation with referral**:
   - Use referral link
   - Create token
   - Verify 0.1 SOL discount applied
   - Check referrer receives 0.05 SOL rebate

3. **Test pricing display**:
   - Verify strikethrough pricing shows 1.2 SOL
   - Base price shows 0.6 SOL
   - With referral shows 0.5 SOL

## Hybrid Pricing Strategy

The hybrid pricing model works as follows:

1. **Display Premium Price**: Show crossed-out 1.2 SOL (anchor price)
2. **Actual Base Fee**: Charge 0.6 SOL (50% discount from anchor)
3. **With Referral**: Charge 0.5 SOL (0.6 - 0.1 discount)
4. **Referrer Rebate**: Pay 0.05 SOL instantly to referrer

This creates psychological value while maintaining profitability:
- Users see they're getting a "deal" (1.2 → 0.6 SOL)
- Referral system drives user acquisition
- On-chain enforcement ensures trust

## Event Monitoring

Listen to program events:
```typescript
program.addEventListener('FeeCollected', (event) => {
  console.log('Fee collected:', event.amount);
});

program.addEventListener('ReferralUsed', (event) => {
  console.log('Referral used:', event.referrer);
});
```

## Production Checklist

Before going to mainnet:

- [ ] Test all instructions on devnet
- [ ] Verify referral system works correctly
- [ ] Test fee calculations
- [ ] Audit smart contract code
- [ ] Test with multiple wallets
- [ ] Verify event emissions
- [ ] Test admin withdrawal function
- [ ] Load test with high volume
- [ ] Security audit (recommended)
- [ ] Update RPC endpoints for mainnet
- [ ] Deploy to mainnet
- [ ] Initialize mainnet program
- [ ] Update frontend to use mainnet program ID

## Troubleshooting

### "anchor: command not found"
Run the setup script: `./scripts/setup-anchor.sh`

### Program ID mismatch
Ensure all three files have the same program ID after `anchor build`

### Insufficient SOL
Airdrop more SOL: `solana airdrop 2`

### Transaction fails
Check program logs: `solana logs YOUR_PROGRAM_ID`

### RPC rate limiting
Use a dedicated RPC like QuickNode or Alchemy

## Support

For issues:
1. Check Anchor documentation: https://www.anchor-lang.com/
2. Review program logs: `solana logs`
3. Test on devnet first
4. Verify account derivations match

## Next Steps

1. ✅ Run `./scripts/setup-anchor.sh`
2. ✅ Build with `anchor build`
3. ✅ Update program IDs
4. ✅ Deploy to devnet
5. ✅ Initialize program
6. ✅ Update frontend components
7. ✅ Test thoroughly
8. ✅ Deploy to mainnet
