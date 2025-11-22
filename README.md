This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Aurum Minimal Token Toolkit

This repository also integrates an Anchor smart contract (program) that handles token creation, locking, burning and referral fee logic. The frontend can operate in two modes:

| Mode | Flag | Behavior |
|------|------|----------|
| Mode | Behavior |
|------|----------|
| Minimal (current) | Pure client-side SPL operations: create mint, transfer to escrow for lock, burn tokens. |
| Anchor (future) | Planned upgrade for enforced time locks & referral economics. |

### Environment Variables

Add/update these in `.env.local` (minimal mode ignores Anchor vars):

```bash
NEXT_PUBLIC_NETWORK=devnet            # or mainnet
NEXT_PUBLIC_FEE_WALLET=<FEE_WALLET_PUBKEY>
NEXT_PUBLIC_AURUM_PROGRAM_ID=<OPTIONAL_PLACEHOLDER>
NEXT_PUBLIC_USE_ANCHOR=0              # keep 0 in minimal mode
```

If `NEXT_PUBLIC_AURUM_PROGRAM_ID` is unset the code falls back to a placeholder. Always replace it with the real deployed program ID before enabling Anchor mode on mainnet.

### Minimal Operations (No Program Required)

All actions use standard SPL Token instructions:

1. Create Mint: Generates a new mint with your wallet as mint & freeze authority, then mints initial supply to your ATA.
2. Lock Tokens: Transfers a chosen amount to a freshly generated escrow keypair (locally generated). Note: This does NOT enforce an on-chain time lock; it's a voluntary escrow. Recovering funds requires possessing the escrow keypair secret (currently not exposed in UI for safety). Upgrade path will replace this with a program-enforced PDA lock.
3. Burn Tokens: Permanently removes tokens from circulation via the SPL burn instruction.

Security Caveat: Without an on-chain program, "lock" is social/voluntary. Don’t treat it as irreversible. For irreversible timelocks or fee/referral mechanics, wait for Anchor integration.

### Planned Anchor Deployment (Optional / Deferred)

1. Generate a dedicated keypair (optional – anchor can auto-generate):
	```bash
	solana-keygen new -o programs/aurum-hybrid-pricing/target/deploy/aurum_hybrid_pricing-keypair.json
	```
2. Ensure the `Anchor.toml` contains (or is updated with) the new program ID under `[programs.<cluster>]` sections.
3. Fund the deployer wallet with enough SOL (rent + compute budget) on chosen cluster.
4. Build the program:
	```bash
	anchor build
	```
5. Deploy:
	```bash
	anchor deploy --provider.cluster devnet
	# or --provider.cluster mainnet
	```
6. Capture the program ID from deploy output OR from `Anchor.toml` after deploy.
7. Copy the generated IDL to the frontend:
	```bash
	cp target/idl/aurum_hybrid_pricing.json src/idl/aurum_hybrid_pricing.json
	```
8. Update `.env.local` with `NEXT_PUBLIC_AURUM_PROGRAM_ID=<PROGRAM_ID>` and set `NEXT_PUBLIC_USE_ANCHOR=1`.
9. Restart the dev server so Next.js picks up the new env vars.

### Smoke Test Script

While Anchor build is blocked (e.g. platform-tools download issues), you can ship immediately using the legacy flow:

1. Ensure `.env.local` has `NEXT_PUBLIC_USE_ANCHOR=0` and correct `NEXT_PUBLIC_FEE_WALLET`.
2. Run the dev server and connect a wallet.
3. Use the Create / Lock / Burn forms; each will perform fee transfer + action via client SPL calls.
4. Capture 3 transaction signatures (create mint, lock tokens, burn tokens) and store them in release notes.
5. Tag a release: `git tag -a v0.1.0-legacy -m "Legacy launch (Anchor pending)" && git push origin --tags`.

After network/toolchain issues resolve, perform the Anchor deployment steps and flip the flag.

### Verifying Deployment

Run these quick checks (replace `<PROGRAM_ID>`):
```bash
solana program show <PROGRAM_ID>
solana account <PROGRAM_ID>
anchor keys list | grep aurum_hybrid_pricing
```

PDAs the frontend expects (derived with seeds):
```text
Config PDA:    find_program_address(seed "config")
Treasury PDA:  find_program_address(seed "treasury")
Referral PDA:  find_program_address(seed "referral", userPubkey)
```

### Upgrading Later

1. Finish program deployment & IDL copy.
2. Set env vars (`PROGRAM_ID`, `USE_ANCHOR=1`).
3. Refresh the UI; forms will automatically route through Anchor instructions.
4. (Optional) Create a referral account first using the dedicated button/flow if added; or call `createReferral` via Anchor CLI.

### Future Enhancements (Backlog)
1. Enforced time locks (program-controlled release)
2. Referral fee & rebate logic
3. Configurable mint metadata via Metaplex token metadata program
4. Program-based treasury & fee withdrawal

1. Re-attempt `anchor build` once platform-tools install succeeds (ensure `SBF_SDK_PATH` set).
2. Deploy with `anchor deploy` (mainnet) and verify program via `solana program show`.
3. Copy fresh IDL to `src/idl/` and flip env flag to `1`.
4. Add on-chain referral account creation UI (if missing) and smoke test each instruction.
5. Retag release (`v0.2.0-anchor`) documenting new on-chain verification.

### Common Pitfalls

- 403 RPC errors: Usually missing API key / restricted endpoint. Use a public cluster URL or provider credentials.
- Placeholder Program ID: If not replaced, PDAs will be incorrect and instructions will fail with `AccountNotFound`.
- Stale IDL: After any program change rerun `anchor build` and copy the updated IDL into `src/idl/`.
- Wrong network: Ensure `NEXT_PUBLIC_NETWORK` matches the cluster you deployed to.

### Minimal Monitoring Snippet (Optional)

Create `scripts/rpc-health-check.ts` (example) to poll slot & performance; run periodically to confirm RPC health. Ask in an issue if you’d like this prebuilt.

---

After completing these steps you should see successful `createToken` transactions and PDAs populated. Enable Anchor mode only once the real program ID and IDL are present.
