# AURUM Solana Token Atelier – Complete Codebase Explanation

Date: 2025-11-21

> This document exhaustively explains every part of the repository. No details are intentionally omitted. It covers architecture, Rust Anchor program, TypeScript/React frontend, helper libraries, configuration, styling, discrepancies, implicit behaviors, security considerations, edge cases, upgrade paths, and improvement suggestions.

## Recent updates (synced with code)

- UI fees aligned with on-chain defaults: Create 0.6 SOL, Lock 0.3 SOL, Burn 0.15 SOL (text also shows referral-discounted values 0.5/0.2/0.05).
- Network is environment-driven via `NEXT_PUBLIC_NETWORK`; explorer links use `EXPLORER_CLUSTER_SUFFIX` consistently.
- Referral account parsing fixed to handle dynamic string length; dashboard now shows correct totals and rebates.
- Client mint creation respects user-selected `decimals`.
- Read-only balance checks use parsed token accounts (no unintended ATA creation).
- On-chain handlers validate optional referral accounts at runtime (no unwrap in constraints).


AURUM is a Solana-based platform for:
1. Creating SPL tokens (mint deployment)
2. Locking tokens (escrow/time-lock concept – partially implemented on-chain, simulated in frontend)
3. Burning tokens
4. Enforcing hybrid pricing with referral discounts and referrer rebates

It consists of two main layers:
- Anchor program (Rust) under `programs/aurum-hybrid-pricing` that enforces on-chain fees and referral logic.
- Next.js 16 + React 19 frontend (`src/`) providing luxury-themed UI and client-side fallback operations (currently not wired fully to Anchor). 

Hybrid Pricing Concept:
- Show a higher “premium anchor price” crossed out (psychological pricing) and charge a lower base fee.
- Further discount when a valid referral code is used.
- Referrer receives a rebate (paid immediately from treasury PDA).

---
## 2. Repository Root Files

### `Anchor.toml`
Defines Anchor workspace configuration:
- `programs.devnet` & `programs.mainnet`: both currently point to placeholder ID `AURMhybridPRICE11111111111111111111111111111`.
- `provider.cluster = "Devnet"` and wallet path.
- `features.resolution = true` (Anchor feature resolution enabled).
- Script alias for tests referencing `ts-mocha` (though no tests are present yet in repo).

### `package.json`
- Dependencies:
  - Next.js 16 (app directory, React 19) – future-facing versions.
  - Solana client libs: `@solana/web3.js`, SPL Token, wallet adapter packages.
  - No `@coral-xyz/anchor` dependency yet (needed for frontend program integration).
  - Dev dependencies include Tailwind CSS v4 (next major), ESLint config, TypeScript 5.
- Scripts: `dev`, `build`, `start`, `lint` only—no test script for Anchor here.

### `tsconfig.json`
- Strict type checking enabled (`strict: true`) but `skipLibCheck: true` avoids library type overhead.
- Module resolution set to `bundler` (Next.js recommended for 16+), path alias `@/* -> ./src/*`.

### `next.config.ts`
- Minimal config enabling experimental `appDir` (App Router).

### Existing Documentation Files
- `README.md` (generic Next.js template – not aligned with project specifics).
- `ARCHITECTURE.md`, `IMPLEMENTATION_SUMMARY.md`, `INTEGRATION_GUIDE.md`, `DEPLOYMENT_CHECKLIST.md` – rich conceptual docs already describing flows, pricing tables, and integration steps. This new file unifies and cross-verifies them with the actual code.

---
## 3. Anchor Program (Rust)
Location: `programs/aurum-hybrid-pricing/`

### 3.1 Cargo Manifest (`Cargo.toml`)
- Crate name: `aurum-hybrid-pricing`
- Edition: 2021
- Dependencies: `anchor-lang` & `anchor-spl` v0.29.0.
- Dev dependencies for local testing: `solana-program-test`, `solana-sdk` v1.17.
- Library configured as both `cdylib` and `lib` for Solana deployment + tests.

### 3.2 `constants.rs`
Defines seeds and default pricing values (in lamports):
```rust
CONFIG_SEED = b"config";
TREASURY_SEED = b"treasury";
REFERRAL_SEED = b"referral";
DEFAULT_CREATE_FEE = 600_000_000;        // 0.6 SOL
DEFAULT_LOCK_FEE   = 300_000_000;        // 0.3 SOL
DEFAULT_BURN_FEE   = 150_000_000;        // 0.15 SOL
DEFAULT_REFERRAL_DISCOUNT = 100_000_000; // 0.1 SOL
DEFAULT_REFERRAL_REBATE   =  50_000_000; // 0.05 SOL
DEFAULT_PREMIUM_ANCHOR_PRICE = 1_200_000_000; // 1.2 SOL display only
REFERRAL_CODE_LENGTH = 8;
```

### 3.3 `state.rs`
Anchor account structs:

1. `Config`
   - Fields: owner, create_fee, lock_fee, burn_fee, referral_discount, referral_rebate, premium_anchor_price, bump.
   - `SPACE` constant manually sums bytes: discriminator(8) + owner(32) + six u64(6*8) + bump(1).

2. `ReferralAccount`
   - Fields: referrer (Pubkey), code (String), total_referrals (u64), rebate_earned (u64), bump.
   - `SPACE` approximates maximum allocation: discriminator(8) + referrer(32) + string length prefix(4) + max 10 chars + 2*u64 + bump.
   - NOTE: Implementation currently slices pubkey base58 first 8 chars; capacity allows up to 10.

3. `Treasury`
   - Tracks `total_collected` & bump.
   - Minimal space: discriminator(8) + u64(8) + bump(1).

### 3.4 `errors.rs`
Enumerated `AurumError` codes for: insufficient fee, invalid referral, unauthorized access, invalid unlock time, arithmetic overflow, invalid fee amount.

### 3.5 `events.rs`
Events emitted for all major lifecycle actions: `FeeCollected`, `ReferralUsed`, `TokenCreated`, `TokensLocked`, `TokensBurned`, `FeesWithdrawn`. Each event includes contextual fields (amounts, actors, timestamps).

### 3.6 `lib.rs`
Core instruction logic. Key points:

#### Instruction: `initialize_config`
- Creates `Config` and `Treasury` PDAs.
- Sets default fees from constants.
- Logs owner public key.

#### Instruction: `update_pricing`
- Owner-only (`has_one = owner` constraint).
- Accepts each fee as `Option<u64>`; only updates provided values.
- No additional validation on fee ranges (improvement opportunity: ensure non-negative, maybe max bounds).

#### Instruction: `create_referral`
- Generates referral code from first 8 characters of user's base58 pubkey string.
- Initializes stats counters to zero.
- Risk: Two different pubkeys with same starting 8 chars (low probability) would collide logically, but PDA seed includes full pubkey so account uniqueness remains.

#### Instruction: `create_token`
Flow:
1. Optional referral code application: if provided and `referral_account` Option is Some and code matches, discount applied (base_fee - referral_discount).
2. Fee transferred from payer to treasury (System Program transfer).
3. Treasury total updated with checked arithmetic.
4. Referral rebate path: If discount applied, a second transfer from treasury PDA to referrer.
   - Uses PDA signer seeds: `[TREASURY_SEED, [treasury.bump]]`.
   - Updates referral stats (increment count, accumulate earned rebate).
   - Emits `ReferralUsed` event.
5. Emits `FeeCollected` and `TokenCreated` events.
6. NOTE: The minted token creation occurs via Anchor account init for `mint` (decimals fixed to 9, authority set to payer). This differs from UI form allowing arbitrary supply and decimals—discrepancy explained later.

#### Instruction: `lock_tokens`
Flow parallels `create_token` for fee logic + rebate. Additional behaviors:
1. Validates `unlock_time > current time`.
2. Transfers fee from locker to treasury.
3. Referral rebate logic identical.
4. Transfers tokens from user token account to `escrow_token_account` (an ATA owned by treasury PDA). This is a simplification; no explicit state account storing lock metadata, unlock enforcement, or later unlock instruction exists. The program currently does not record lock parameters on-chain beyond the emitted event.
5. Emits `TokensLocked` and `FeeCollected`.
6. Security Gap: Without a dedicated escrow/lock state storing unlock timestamp and preventing premature withdrawal, tokens reside in treasury-owned ATA; no unlock instruction implemented. They are effectively transferred away, not provably time-locked. (Improvement section will address.)

#### Instruction: `burn_tokens`
Flow similar: discount evaluation -> fee transfer -> rebate -> SPL token burn via CPI.
Events: `FeeCollected`, `TokensBurned`.

#### Instruction: `withdraw_fees`
- Owner-only action moving SOL from treasury PDA to owner.
- Uses PDA signer seeds again.
- Does NOT update `total_collected` (that field tracks gross fees, not net remaining). For accounting, consider adding a `withdrawn_total` field.

#### PDA Account Constraints
- `CreateToken`, `LockTokens`, `BurnTokens` contexts allow `referral_account: Option<Account<ReferralAccount>>` and a separate optional `referrer: Option<AccountInfo>` to receive rebate. If no referral code is used, these can be None. However the constraint uses seeds referencing `referral_account.as_ref().unwrap()` which will panic if passed None at runtime before Anchor constraint evaluation.
- This is a latent bug: the instruction expects Option but constraints assume Some. Safer pattern: separate remaining accounts or remove Option usage. Must fix before production.

#### Seeds & Bumps
All PDAs derive from fixed seeds, enabling deterministic fetching in frontend.

### 3.7 Security & Logic Observations (Rust)
1. Referral application logic does not validate non-empty code format beyond equality; could accept any matching 8-ch substring—even if user modifies length when passed from frontend (Rust code only checks equality). 
2. Rebate transfer size is constant; no guard prevents referral discount > base fee (would underflow). Present checked subtraction prevents overflow but if `referral_discount > base_fee` final fee becomes negative attempt → overflow error returned.
3. Time-lock incomplete: No unlocking instruction; tokens placed in escrow token account controlled by treasury; no metadata ties them to a locker or schedule.
4. Missing rate limiting or antifraud for referral creation; a user could create one referral account only once (PDA uniqueness); that’s fine.
5. Treasury SOL balance depletion risk: If referral rebate is larger than fee collected (misconfiguration) first referral attempt would try to transfer unexisting lamports, causing failure.
6. No reentrancy concerns because Solana runtime and Anchor CPI semantics limit that risk.
7. Arithmetic handled by `checked_add` / `checked_sub`; good overflow protection.

### 3.8 Event Offsets & Account Parsing Notes
Frontend parsing is now corrected for `ReferralAccount` (dynamic string length). Using Anchor IDL-based parsers is still recommended for long-term robustness.

---
## 4. Frontend: Next.js App Router
Location: `src/app/`

### Global Layout (`layout.tsx`)
Sets fonts (Playfair Display, Cormorant Garamond, Montserrat). Provides navigation bar with links: Home, Create, Locker, Burn; integrates `ConnectWalletButton` and `WalletProvider`.

### Pages
- `page.tsx` (Home): Hero section; pricing display (shows 1.2 SOL -> 0.6 SOL, notes 0.5 SOL with referral). Feature grid, referral program explanation, call-to-action section.
- `create/page.tsx`: Intro + stylized step indicators + `CreateTokenForm` inside bordered card. Displays service fee “0.6 SOL per token creation (0.5 SOL with referral)”. Form uses client helper functions (not yet Anchor) and respects user-provided decimals.
- `locker/page.tsx`: Similar structure for locking; fee displayed “0.3 SOL service fee (0.2 SOL with referral)”. Provides instructions & use cases.
- `burn/page.tsx`: Burn token flow; fee displayed “0.15 SOL service fee (0.05 SOL with referral)”. Warning banner for irreversibility.

### Current alignment and remaining gaps
- Fees displayed in the UI now match on-chain defaults (0.6 / 0.3 / 0.15 SOL). The “with referral” values shown in text (0.5 / 0.2 / 0.05 SOL) reflect the intended discount, but referral discounts/rebates are still not enforced by client flows until Anchor integration is wired.
- Pages still call client helpers that transfer fees to an env-configured wallet; moving to program instructions remains a priority.

---
## 5. Frontend Components (`src/components/`)

### `WalletProvider.tsx`
- Wraps application in Solana wallet context with network driven by `NEXT_PUBLIC_NETWORK` and endpoint from centralized config. Explorer links and connection endpoint are now consistent across environments.

### `ConnectWalletButton.tsx`
- Dynamic import of `WalletMultiButton` (SSR disabled). Overrides wallet adapter UI styles globally with gold luxury theme.

### `CreateTokenForm.tsx`
- Gathers token metadata: name, symbol, description, supply, decimals.
- Submission calls `createMintWithFee` (client-only helper) not the Anchor `create_token` instruction. Mint creation uses `createMint` and `mintTo` directly—no fee enforcement by Anchor. Fee handled by simple SOL transfer to `FEE_WALLET` env var.
- Fee amount: 0.6 SOL (text shows 0.5 SOL with referral for future on-chain integration).
- Decimals provided by the user are respected in the mint creation call.
- Displays result (mint address, transaction signature) with environment-driven explorer links.
- Missing referral code input (planned once Anchor client is integrated).

### `LockerForm.tsx`
- Accepts mint address, amount, unlock date/time.
- Transfers fee (0.3 SOL) then moves tokens to an escrow token account owned by a temporary keypair (MVP). This will be replaced by a program-owned PDA with unlock enforcement.
- No referral integration yet; countdown is local-only (not enforced on-chain).
- Amount is interpreted as raw token units (integer). Fractional inputs will fail because the underlying transfer uses `BigInt(amount)`. For 6 decimals, 1 token = 1,000,000 units; for 9 decimals, 1 token = 1,000,000,000 units.

### `BurnForm.tsx`
- Transfers fee (0.15 SOL) then calls SPL burn instruction directly.
- Shows amount burned and remaining balance.
- Social share link generator referencing window object (will fail SSR if executed during server render but component is client-only so safe).
- No referral discount/rebate logic.

### `ReferralBox.tsx`
- Loads referral data using `fetchReferralAccount`, which now correctly parses account data (dynamic string length). 
- Provides copy referral link button. Creating referral accounts is not yet wired to the Anchor instruction, so the dashboard shows data only if a referral account already exists on-chain.

### Shared Observations
1. All forms rely on helper functions in `solana.ts` rather than Anchor – representing a pre-Anchor MVP.
2. No state management library; simple React `useState` only.
3. Absence of error boundary or transaction simulation pre-check.

---
## 6. Helper Libraries (`src/lib/`)

### `config.ts`
Exports are centralized and environment-driven:
```ts
export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK as 'mainnet'|'devnet'|'testnet') || 'devnet';
export const RPC_URL = NETWORK === 'mainnet' ? 'https://api.mainnet-beta.solana.com' : NETWORK === 'testnet' ? 'https://api.testnet.solana.com' : 'https://api.devnet.solana.com';
export const EXPLORER_CLUSTER_SUFFIX = NETWORK === 'mainnet' ? '' : `?cluster=${NETWORK}`;
export const FEE_WALLET = process.env.NEXT_PUBLIC_FEE_WALLET || '';
```
- Removes hard-coded mainnet; explorer links and RPC align with the selected network. `FEE_WALLET` is optional string; ensure it’s set before using client flows.

### `solana.ts`
Implements client-side simplified operations bypassing Anchor smart contract.

Functions:
1. `createMintWithFee`
   - Transfers 0.6 SOL fee to fee wallet (aligned with on-chain default).
   - Creates mint with the user-selected `decimals` and mints the provided `supply` to the user’s ATA.
2. `lockTokensWithFee`
   - Transfers 0.3 SOL fee.
   - Uses an ephemeral escrow keypair (placeholder for PDA) and transfers tokens using `createTransferInstruction` with `BigInt(amount)` (requires integer raw units).
3. `burnTokensWithFee`
   - Transfers 0.15 SOL fee, then burns tokens via SPL.
4. `getTokenBalance`
   - Uses `getParsedTokenAccountsByOwner` to aggregate balances without creating accounts as a side effect.

Issues & Risks:
- Fees are not validated; user could bypass by forking client code. No contract enforcement.
- Escrow pattern incomplete; ephemeral keypair undermines lock semantics.
- Potential unintended token account creation for read-only ops.

### `pricing.ts`
Helper for future Anchor integration (currently partially stubbed):
Functions:
1. `findConfigPDA`, `findTreasuryPDA`, `findReferralPDA`: deterministic seeds with current placeholder program ID.
2. `fetchPricingConfig(connection)`: manual buffer parsing using correct offsets for `Config`.
3. `calculateFinalFee`, `calculateFeeBreakdown`: pure helpers for discount calculations.
4. `lamportsToSOL`, `SOLToLamports`: formatting utilities.
5. `getReferralCodeFromURL`, `generateReferralLink`: URL-based referral code extraction/link generation.
6. `fetchReferralAccount`: corrected dynamic parsing (string length + code), then counters and rebates.
7. `createReferralAccount(program, userPubkey)`: Prepared Anchor RPC call (requires `@coral-xyz/anchor` and IDL). Not wired in UI yet.

Types defined for `PricingConfig`, `ReferralAccountData`, and `FeeBreakdown`.

Risks:
- Manual buffer parsing brittle; changing struct order breaks client.
- Inconsistent network (mainnet RPC vs devnet operations).
- Program ID placeholder will fail after actual deployment unless updated.

---
## 7. Styling (`globals.css`)
Defines:
- CSS custom properties for palette (gold/cream/charcoal, etc.).
- Font families mapping to loaded Google Fonts.
- Custom animations: `fadeIn`, `slideUp`, `slideIn`, `shimmer`.
- Scrollbar styling with gold gradient.
- Utility classes: `.gold-text` gradient text, `.card-hover`, `.underline-gold`.
- Tailwind v4 import via `@import "tailwindcss";` (assumes postcss config set).

Note: Some class names referenced in components (`bg-charcoal`, `text-gold`) rely on Tailwind color injection or custom classes; ensure Tailwind config includes these (config file not shown, potential mismatch).

---
## 8. Script: `scripts/setup-anchor.sh`
Automates installation of Rust, Solana CLI, Anchor version manager (avm) & sets next steps. Idempotent checks via `command -v`. Ends with guidance for build/deploy/initialize.

Potential Improvement:
- Add OS detection, caching logic, and conditional upgrade path.
- Provide direct `anchor keys list` reminder.

---
## 9. Current status vs remaining gaps

| Category | Current Code | Remaining Gap |
|----------|--------------|---------------|
| Fees (Create/Lock/Burn) | UI displays 0.6 / 0.3 / 0.15 SOL | Enforce via Anchor instructions instead of client transfers |
| Referral Flow | Dashboard parses account correctly | No in-app creation; discounts/rebates not applied in client flows |
| Token Decimals | Client and on-chain support decimals | Wire frontend to Anchor `create_token` |
| Supply Initialization | Client mints full supply locally | Add on-chain `mint_to` or initial supply arg in Anchor |
| Time Lock | Client locks to ephemeral keypair | Implement program-owned escrow + `unlock_tokens` |
| Network | Env-driven across wallet, RPC, explorer | None |
| Account Parsing | Fixed for `ReferralAccount` | Prefer IDL-based parsing for resilience |
| Program Events Frontend | Not implemented | Add event listeners for real-time UI updates |

---
## 10. Data Layout & Buffer Parsing Details

### Config Account Serialization (Anchor)
Order: discriminator(8) | owner(32) | create_fee(8) | lock_fee(8) | burn_fee(8) | referral_discount(8) | referral_rebate(8) | premium_anchor_price(8) | bump(1)

Offsets used in `pricing.ts`:
- `createFee` at 40 → correct (8 + 32)
- `lockFee` at 48
- `burnFee` at 56
- `referralDiscount` at 64
- `referralRebate` at 72
- `premiumAnchorPrice` at 80
- Missing bump parse (at 88) – not required for pricing display.

### ReferralAccount Serialization
Actual offsets (assuming 8-char code):
- discriminator: 0–7
- referrer: 8–39
- string length prefix: 40–43 (value = 8)
- code bytes: 44–51
- total_referrals: 52–59
- rebate_earned: 60–67
- bump: 68

Frontend previously used 76 & 84 which overshot; this has been fixed.

### Treasury Account
`total_collected` starts at offset 8; bump at 16.

---
## 11. Referral Logic Nuances
1. Only one referral account per wallet due to PDA seed `["referral", user_pubkey]`.
2. Referral code is not random; predictable from pubkey first 8 chars. This aids guessability – consider hashing or base58 slicing with collision mitigation.
3. Rebate transfer uses treasury PDA signing; ensures controlled outflow.
4. No limit on referrals; stats accumulate indefinite.
5. Potential future extension: dynamic tiers (more referrals -> higher rebate or lower discount).

---
## 12. Security Review Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Fee Enforcement | On-chain (Rust) correct | Frontend bypass risk until integrated |
| Referral Validation | Basic equality | Could add case normalization & length check |
| Time Lock | Incomplete | Requires dedicated state + unlock instruction |
| PDA Access | Deterministic seeds, bump stored | Good; ensure seeds never reused for other semantics |
| Overflow | `checked_add` / `checked_sub` used | Safe arithmetic |
| Unauthorized Ops | `has_one = owner` for pricing & withdrawal | Proper but consider explicit `Signer` check for config owner update |
| Fund Isolation | Treasury PDA collects all lamports | Need lamport balance check before rebate transfer to avoid failure |
| Frontend Hardcoded Fees | Reduced | UI aligned; enforce via Anchor integration next |
| Network Mismatch (mainnet vs devnet) | Resolved | Centralized env-driven network config |

---
## 13. Edge Cases & Failure Modes
1. Referral discount > base fee → subtraction overflow (returns `ArithmeticOverflow`). Must add validation in `update_pricing`.
2. Treasury lamports insufficient for rebate (e.g., misconfigured fees) → rebate transfer fails leaving partial changes (fee collected but referral stats unchanged). Emit event ordering ensures logical sequence but no rollback semantics—acceptable in Solana context.
3. Unlock time equal to current timestamp (`unlock_time == now`) → rejected; must be strictly greater.
4. Multi-use referral by same referee: Allowed; each action triggers discount + rebate.
5. Withdrawal while referral rebate pending: Race condition minimal; sequential transactions on Solana finalize atomic state per instruction.
6. Large number of referrals may bloat referral accounts only via counters (no dynamic array), so safe.
7. Frontend ephemeral escrow keypair lost (locker form) → tokens unrecoverable; must replace with program-owned PDA.

---
## 14. Recommended Improvements (Prioritized)
1. Integrate Anchor client: add `@coral-xyz/anchor` and replace helper functions with program instructions.
2. Prefer IDL-based account decoding on the frontend (more robust than manual parsing).
3. Implement `LockState` account: fields (mint, locker, amount, unlock_time, escrow_token_account, bump) + `unlock_tokens` instruction.
4. Add initial supply (mint_to) path in `create_token` or take supply as an argument.
5. Add pricing invariants in `update_pricing` (e.g., `referral_discount <= create_fee`, `referral_rebate <= referral_discount`).
6. Event listener integration: Use connection websocket or Anchor subscription to update UI in real-time.
7. Replace manual time countdown logic with on-chain derived state queries.
8. Maintain treasury withdrawal ledger (add field `withdrawn_total`).
9. Add unit tests (Rust + TypeScript) for all instructions (fee changes, referral rebate correctness, failure cases).

---
## 15. Example Integration Flow After Improvements
Frontend token creation (pseudo):
```ts
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, AURUM_PROGRAM_ID, provider);
const [config] = findConfigPDA();
const [treasury] = findTreasuryPDA();
const mintKeypair = Keypair.generate();

await program.methods
   .createToken(decimals, referralCode || null)
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

---
## 16. Environment & Configuration Alignment Checklist
| Item | Current | Target |
|------|---------|--------|
| Program ID | Placeholder | Real deployed ID (devnet/mainnet) |
| RPC URL | Hard-coded mainnet | Driven by `.env` variable |
| Fee Wallet | Env variable required | Replace with Treasury PDA only |
| Explorer Cluster Links | Devnet query param | Switch based on network |

---
## 17. Deployment Sequence (Validated Against Code)
1. Run `./scripts/setup-anchor.sh`.
2. `solana config set --url devnet`.
3. `anchor build` -> derive program ID.
4. Update `declare_id!`, `Anchor.toml`, `pricing.ts` constant.
5. `anchor build` again.
6. `anchor deploy`.
7. Initialize with custom script (create both PDAs).
8. Add frontend Anchor dependency & IDL import.
9. Replace client helper calls with Anchor instruction invocations.
10. Validate referral creation & discount flows.

---
## 18. Testing Strategy Suggestions
### Rust
- Unit tests using `solana-program-test` for: referral discount, rebate transfer, pricing update permissions, overflow prevention.
### Frontend
- Integration tests (Playwright / Cypress) for form submission under both referral and non-referral scenarios.
### Property Tests
- Generate random fee schedules ensuring invariants hold.

---
## 19. Potential Bugs & Quick Fixes Summary
| Issue | Impact | Status / Quick Fix |
|-------|--------|--------------------|
| Optional referral constraints unwrap risk | Runtime panic if no referral provided | Fixed: runtime validation; no unwrap in constraints |
| Referral parsing offsets | Referral stats incorrect | Fixed: dynamic parsing for string length implemented |
| Network mismatch (wallet vs explorer) | User confusion / wrong balances | Fixed: env-driven network across wallet, RPC and explorer |
| Ephemeral escrow keypair (lock) | Tokens effectively lost control | Known: implement program escrow & unlock instruction |
| Fees in frontend | Mismatch with on-chain | Fixed: UI aligned; enforce via Anchor integration next |
| Decimals parameterization | Inconsistent token spec | Fixed: client and on-chain support decimals argument |
| Absent supply minting on-chain | Users get empty mint | Known: add CPI `mint_to` or initial supply argument |

---
## 20. Architectural Cohesion Notes
Current design mixes prototype client-only logic and planned Anchor-enforced logic. Transition tasks:
1. Remove direct SOL fee transfers to `FEE_WALLET` in favor of Anchor instructions.
2. Consolidate referral UI (input field + dashboard) across pages.
3. Synchronize displayed pricing with on-chain values fetched every load (UI amounts already aligned; next step is to fetch from `Config`).
4. Introduce caching layer for pricing config.

---
## 21. Performance Considerations
1. Fetching account info for each render (ReferralBox) could cause rate limiting; implement memoization or on-demand refresh.
2. Avoid creating token accounts during balance reads—use `getParsedTokenAccountsByOwner` instead.
3. Batch PDA fetches with `getMultipleAccountsInfo` when scaling.

---
## 22. Future Extensions
1. Dynamic pricing tiers (volume-based discounts).
2. NFT-based premium memberships adjusting rebate/discount.
3. Analytics dashboard (aggregate events streamed).
4. DAO governance for adjusting fees.
5. Multi-language localization.
6. Social referral leaderboard.

---
## 23. Event Consumption Pattern (Not Yet Implemented Frontend)
Pseudo-code:
```ts
program.addEventListener('FeeCollected', (e) => updateUI(e));
program.addEventListener('ReferralUsed', (e) => refreshReferralStats(e.referrer));
```
Requires Anchor provider + stable websocket connection; consider exponential backoff retries.

---
## 24. Compliance / Reliability Notes
1. Ensure production uses audited program (third-party review recommended).
2. Provide clear disclaimers for irreversible actions (burn, lock).
3. Environment separation: devnet, testnet, mainnet distinct deployments.

---
## 25. Summary of Critical Alignment Tasks Before Mainnet
1. Replace placeholder program ID.
2. Fix referral parsing & Option unwrap logic.
3. Implement true lock/unlock lifecycle.
4. Align frontend displayed fees with on-chain config.
5. Parameterize decimals & supply.
6. Add tests & monitoring.
7. Security audit.

---
## 26. Glossary
- **PDA (Program Derived Address)**: Deterministic address owned by a program, used to store state.
- **Lamports**: Smallest unit of SOL (1 SOL = 1,000,000,000 lamports).
- **Rebate**: Portion of fee paid back to referrer.
- **Referral Discount**: Reduction of fee for the user supplying referral code.
- **Anchor**: Framework simplifying Solana smart contract development with declarative accounts & IDL.
- **IDL**: Interface Definition Language; JSON describing program structs & instructions used by clients.

---
## 27. Final Integrity Check
All source files accounted for:
- Rust: constants.rs, state.rs, errors.rs, events.rs, lib.rs
- TS/React: pages, forms, wallet integration, helpers (pricing.ts, solana.ts, config.ts)
- Scripts: setup-anchor.sh
- Styles: globals.css
- Docs: architecture & integration guides + this comprehensive explanation.

No intentional omissions. Discrepancies and bugs highlighted with remediation paths.

---
## 28. Quick Remediation Checklist
```text
[ ] Add @coral-xyz/anchor to package.json
[ ] Generate IDL after deploy and import in frontend
[ ] Replace fee wallet flows with program instructions
[ ] Fix referral Option unwrap constraint
[ ] Correct referral account parsing (IDL fetch)
[ ] Implement LockState + unlock_tokens
[ ] Parameterize decimals & initial supply
[ ] Align network configuration (env-driven)
[ ] Add tests (Rust + frontend integration)
[ ] Introduce monitoring & event listeners
```

---
## 29. Closing Note
AURUM’s current state blends prototype logic and production-ready smart contract architecture. Completing the integration steps will transition from trust-by-UI to trust-by-chain, ensuring authentic, tamper-resistant pricing and referral economics.

*End of full codebase explanation.*
