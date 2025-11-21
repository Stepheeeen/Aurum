# AURUM Deployment Checklist

## Pre-Deployment Setup

### ✅ Phase 1: Environment Setup
- [ ] Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- [ ] Install Solana CLI: `sh -c "$(curl -sSfL https://release.solana.com/stable/install)"`
- [ ] Install Anchor CLI: `cargo install --git https://github.com/coral-xyz/anchor avm --locked --force`
- [ ] Configure Solana: `solana config set --url devnet`
- [ ] Create/Load Wallet: `solana-keygen new` or `solana-keygen recover`
- [ ] Airdrop SOL: `solana airdrop 2`

**Or run automated script:**
```bash
./scripts/setup-anchor.sh
```

---

## ✅ Phase 2: Build & Deploy Anchor Program

### Step 1: Build Program
```bash
cd /Users/admin/Github/solana-token-deployer
anchor build
```
- [ ] Build completes without errors
- [ ] Target directory created: `target/deploy/`

### Step 2: Get Program ID
```bash
anchor keys list
```
- [ ] Copy the program ID (starts with uppercase letters/numbers)
- [ ] Save it for next steps

### Step 3: Update Program IDs

**File 1: `programs/aurum-hybrid-pricing/src/lib.rs`** (Line 9)
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```
- [ ] Updated with your program ID

**File 2: `Anchor.toml`** (Lines 9 & 12)
```toml
[programs.devnet]
aurum_hybrid_pricing = "YOUR_PROGRAM_ID_HERE"

[programs.mainnet]
aurum_hybrid_pricing = "YOUR_PROGRAM_ID_HERE"
```
- [ ] Updated both devnet and mainnet

**File 3: `src/lib/pricing.ts`** (Line 6)
```typescript
export const AURUM_PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
```
- [ ] Updated with your program ID

### Step 4: Rebuild
```bash
anchor build
```
- [ ] Rebuild completes successfully

### Step 5: Deploy to Devnet
```bash
solana config set --url devnet
anchor deploy
```
- [ ] Deployment successful
- [ ] Transaction signature received
- [ ] Verify: `solana program show YOUR_PROGRAM_ID`

### Step 6: Initialize Program
```bash
# Create initialize script if not exists
npx ts-node -e "
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import idl from './target/idl/aurum_hybrid_pricing.json';

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = new Program(idl, provider);
  
  const [config] = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('config')], program.programId
  );
  const [treasury] = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')], program.programId
  );
  
  await program.methods.initializeConfig()
    .accounts({
      config, treasury,
      owner: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
  
  console.log('✅ Initialized!');
  console.log('Config:', config.toString());
  console.log('Treasury:', treasury.toString());
}
main();
"
```
- [ ] Program initialized successfully
- [ ] Config PDA created
- [ ] Treasury PDA created

---

## ✅ Phase 3: Frontend Integration

### Step 1: Install Dependencies
```bash
npm install @coral-xyz/anchor
# or
yarn add @coral-xyz/anchor
```
- [ ] Dependency installed
- [ ] No version conflicts

### Step 2: Update CreateTokenForm.tsx

Add imports:
```typescript
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import idl from '../../target/idl/aurum_hybrid_pricing.json';
import { AURUM_PROGRAM_ID, findConfigPDA, findTreasuryPDA } from '@/lib/pricing';
```

Replace fee transfer logic in `handleSubmit`:
```typescript
// Old: Direct SOL transfer
// const feeTransfer = SystemProgram.transfer({ ... });

// New: Anchor instruction
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, provider);

const [config] = await findConfigPDA();
const [treasury] = await findTreasuryPDA();

const tx = await program.methods
  .createToken(Number(formData.decimals), referralCode || null)
  .accounts({
    mint: mintKeypair.publicKey,
    config,
    treasury,
    payer: wallet.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .signers([mintKeypair])
  .rpc();
```

Add referral input field:
```tsx
<div>
  <label className="block text-sm text-cream/60 mb-2">
    Referral Code (Optional)
  </label>
  <input
    type="text"
    value={referralCode}
    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
    placeholder="Enter 8-char code for 0.1 SOL discount"
    className="w-full bg-black/40 border border-gold/30 text-cream px-4 py-3 rounded"
    maxLength={8}
  />
  <p className="text-cream/40 text-xs mt-1">
    Save 0.1 SOL with a referral code
  </p>
</div>
```

- [ ] Imports added
- [ ] Anchor program integration complete
- [ ] Referral code input added
- [ ] Form tested successfully

### Step 3: Update LockerForm.tsx

Similar updates:
```typescript
const unlockTimestamp = Math.floor(new Date(`${formData.unlockDate}T${formData.unlockTime}`).getTime() / 1000);

await program.methods
  .lockTokens(
    new BN(Number(formData.amount) * Math.pow(10, 9)),
    new BN(unlockTimestamp),
    referralCode || null
  )
  .accounts({
    mint: new PublicKey(formData.mintAddress),
    userTokenAccount,
    escrowTokenAccount,
    config,
    treasury,
    locker: wallet.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

- [ ] Updated to use Anchor
- [ ] Referral input added
- [ ] Tested successfully

### Step 4: Update BurnForm.tsx

```typescript
await program.methods
  .burnTokens(
    new BN(Number(formData.amount) * Math.pow(10, 9)),
    referralCode || null
  )
  .accounts({
    mint: new PublicKey(formData.mintAddress),
    userTokenAccount,
    config,
    treasury,
    burner: wallet.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

- [ ] Updated to use Anchor
- [ ] Referral input added
- [ ] Tested successfully

### Step 5: Add ReferralBox to Pages

Add to each page (create, locker, burn):
```tsx
import ReferralBox from '@/components/ReferralBox';

// Change layout to grid:
<div className="grid lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">
    {/* Existing form */}
  </div>
  <div>
    <ReferralBox />
  </div>
</div>
```

- [ ] Added to /create page
- [ ] Added to /locker page
- [ ] Added to /burn page
- [ ] Displays correctly

---

## ✅ Phase 4: Testing

### Devnet Testing

**Test 1: Token Creation Without Referral**
- [ ] Connect wallet
- [ ] Fill out token form
- [ ] Leave referral code empty
- [ ] Pay 0.6 SOL fee
- [ ] Token created successfully
- [ ] Transaction on Solana Explorer
- [ ] Fee shows in treasury

**Test 2: Token Creation With Referral**
- [ ] Get referral code from ReferralBox
- [ ] Create second wallet
- [ ] Use referral code
- [ ] Pay 0.5 SOL fee (0.1 SOL discount)
- [ ] Referrer receives 0.05 SOL rebate
- [ ] Stats update in ReferralBox

**Test 3: Token Locking**
- [ ] Lock tokens without referral: 0.3 SOL
- [ ] Lock tokens with referral: 0.2 SOL
- [ ] Tokens transferred to escrow
- [ ] Unlock time enforced

**Test 4: Token Burning**
- [ ] Burn without referral: 0.15 SOL
- [ ] Burn with referral: 0.05 SOL
- [ ] Tokens burned successfully
- [ ] Supply decreased

**Test 5: Referral System**
- [ ] Referral code generated
- [ ] Code is 8 characters
- [ ] Link copies correctly
- [ ] Stats show correctly
- [ ] Multiple referrals work

**Test 6: Admin Functions**
- [ ] Withdraw fees (admin wallet)
- [ ] Update pricing (admin wallet)
- [ ] Non-admin cannot access

---

## ✅ Phase 5: Mainnet Deployment

### Pre-Mainnet Checklist
- [ ] All devnet tests pass
- [ ] Security audit completed (recommended)
- [ ] Admin wallet secured (hardware wallet recommended)
- [ ] Emergency procedures documented
- [ ] Backup admin keys stored securely

### Mainnet Steps
1. **Deploy Program**
   ```bash
   solana config set --url mainnet-beta
   anchor deploy
   ```
   - [ ] Deployment successful
   - [ ] Sufficient SOL for deployment (~15-20 SOL)

2. **Initialize Mainnet Program**
   - [ ] Run initialization script
   - [ ] Verify Config PDA
   - [ ] Verify Treasury PDA

3. **Update Frontend**
   - [ ] Change RPC to mainnet
   - [ ] Update program ID references
   - [ ] Test on mainnet
   - [ ] Monitor transactions

4. **Monitoring**
   - [ ] Set up transaction monitoring
   - [ ] Monitor treasury balance
   - [ ] Track referral usage
   - [ ] Monitor for errors

---

## ✅ Phase 6: Go Live

### Final Checks
- [ ] All pages load correctly
- [ ] Wallet connection works
- [ ] Pricing displays correctly
- [ ] Referral system functional
- [ ] Mobile responsive
- [ ] Cross-browser tested

### Launch
- [ ] Announce on Twitter
- [ ] Share referral links
- [ ] Monitor first transactions
- [ ] Provide support
- [ ] Gather feedback

---

## 🚨 Emergency Procedures

### If Transaction Fails
1. Check program logs: `solana logs YOUR_PROGRAM_ID`
2. Verify account balances
3. Check account derivations
4. Review transaction simulation

### If Pricing Needs Update
1. Connect admin wallet
2. Call `update_pricing` instruction
3. Verify changes on-chain
4. Test with small transaction

### If Treasury Full
1. Admin connects wallet
2. Call `withdraw_fees` instruction
3. Specify amount or withdraw all
4. Secure withdrawn funds

---

## 📊 Success Metrics

Track these KPIs:
- [ ] Total tokens created
- [ ] Total fees collected
- [ ] Referral usage rate
- [ ] Average fee discount
- [ ] User retention
- [ ] Transaction success rate

---

## 🎯 Post-Launch

- [ ] Monitor gas fees
- [ ] Track user feedback
- [ ] Plan feature updates
- [ ] Optimize UX based on data
- [ ] Expand referral program
- [ ] Build community

---

**Current Status**: ✅ Anchor program complete, ready for deployment

**Next Step**: Run `./scripts/setup-anchor.sh` and follow Phase 2

---

*For support, refer to INTEGRATION_GUIDE.md*
