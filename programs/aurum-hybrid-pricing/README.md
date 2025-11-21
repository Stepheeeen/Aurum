# AURUM Hybrid Pricing - Anchor Program

## Overview

This Anchor program implements on-chain fee enforcement and a referral system for the AURUM Solana Token Atelier platform.

## Features

- **On-Chain Pricing**: All fees are enforced by the smart contract
- **Referral System**: Users can generate referral codes and earn rebates
- **Hybrid Pricing Model**: Display premium pricing with actual lower costs
- **Instant Rebates**: Referrers receive rewards immediately on-chain
- **Fee Collection**: Admin can withdraw accumulated fees

## Fee Structure

| Operation | Premium Price | Base Fee | With Referral | Rebate to Referrer |
|-----------|--------------|----------|---------------|-------------------|
| Create Token | 1.2 SOL | 0.6 SOL | 0.5 SOL | 0.05 SOL |
| Lock Tokens | 0.6 SOL | 0.3 SOL | 0.2 SOL | 0.05 SOL |
| Burn Tokens | 0.3 SOL | 0.15 SOL | 0.05 SOL | 0.05 SOL |

**Referral Discount**: 0.1 SOL off any transaction  
**Referral Rebate**: 0.05 SOL paid instantly to referrer

## Architecture

### Program Accounts (PDAs)

1. **Config** - Stores pricing configuration
   - Seeds: `["config"]`
   - Owner: Admin public key
   - Contains: All fee amounts and program settings

2. **Treasury** - Collects all fees
   - Seeds: `["treasury"]`
   - Owner: Program
   - Contains: Total collected amount

3. **ReferralAccount** - Per-user referral tracking
   - Seeds: `["referral", user_pubkey]`
   - Owner: Program
   - Contains: Referral code, stats, earnings

### Instructions

#### `initialize_config`
Initialize the program with default pricing (admin only)

#### `update_pricing`
Update fee amounts (admin only)

#### `create_referral`
Generate a referral code for a user

#### `create_token`
Create a new SPL token with fee enforcement
- Accepts optional referral code
- Applies discount if valid
- Pays rebate to referrer

#### `lock_tokens`
Lock tokens in escrow with time lock
- Accepts optional referral code
- Transfers tokens to escrow
- Enforces unlock time

#### `burn_tokens`
Burn tokens permanently
- Accepts optional referral code
- Burns tokens via CPI

#### `withdraw_fees`
Withdraw accumulated fees (admin only)

## Setup Instructions

### Prerequisites

1. **Install Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

3. **Install Anchor CLI**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

### Build & Deploy

1. **Build the program**
   ```bash
   anchor build
   ```

2. **Get the program ID**
   ```bash
   anchor keys list
   ```

3. **Update the program ID** in:
   - `programs/aurum-hybrid-pricing/src/lib.rs` (declare_id!)
   - `Anchor.toml` (programs section)
   - `src/lib/pricing.ts` (AURUM_PROGRAM_ID)

4. **Rebuild after updating IDs**
   ```bash
   anchor build
   ```

5. **Deploy to devnet**
   ```bash
   solana config set --url devnet
   anchor deploy
   ```

6. **Initialize the program**
   ```bash
   anchor run initialize
   ```

### Generate TypeScript Client

```bash
anchor idl parse -f programs/aurum-hybrid-pricing/src/lib.rs -o target/idl/aurum_hybrid_pricing.json
```

The IDL will be automatically generated in `target/idl/` and can be used with `@coral-xyz/anchor` in the frontend.

## Frontend Integration

### Install Dependencies

```bash
npm install @coral-xyz/anchor
# or
yarn add @coral-xyz/anchor
```

### Usage Example

```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';

// Load the IDL
import idl from '../target/idl/aurum_hybrid_pricing.json';

function useAurumProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  
  const provider = new AnchorProvider(connection, wallet, {});
  const program = new Program(idl, provider);
  
  return program;
}

// Create token with referral
async function createToken(program, referralCode?: string) {
  const [configPDA] = await findConfigPDA();
  const [treasuryPDA] = await findTreasuryPDA();
  
  await program.methods
    .createToken(9, referralCode || null)
    .accounts({
      mint: newMint.publicKey,
      config: configPDA,
      treasury: treasuryPDA,
      // ... other accounts
    })
    .rpc();
}
```

## Testing

```bash
anchor test
```

## Events

The program emits the following events for frontend integration:

- `FeeCollected` - When fees are paid
- `ReferralUsed` - When a referral code is applied
- `TokenCreated` - When a token is created
- `TokensLocked` - When tokens are locked
- `TokensBurned` - When tokens are burned
- `FeesWithdrawn` - When admin withdraws fees

## Security Considerations

- All fees are enforced on-chain
- PDAs prevent unauthorized access
- Admin functions protected by `has_one` constraints
- Referral rebates paid from treasury with proper signer
- All arithmetic operations use checked math

## License

MIT
