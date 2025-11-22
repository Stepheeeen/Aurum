/*
 * Legacy smoke test script for Aurum (pre-Anchor deployment)
 * Performs: create mint + fee, lock tokens, burn tokens.
 * Usage:
 *   npx ts-node scripts/smoke-legacy.ts [supply] [decimals]
 * Env (optional): KEYPAIR_PATH=~/.config/solana/id.json RPC_URL=https://api.mainnet-beta.solana.com
 */
// Legacy smoke test script (CommonJS require for lib import)
/* eslint-disable @typescript-eslint/no-var-requires */
import { readFileSync } from 'fs';
import path from 'path';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram
} from '@solana/web3.js';
// CommonJS style require to bypass TS extension resolution issues under ts-node/register
const { createMintWithFee, lockTokensWithFee, burnTokensWithFee } = require('../src/lib/solana');

const DEFAULT_KEYPAIR = process.env.KEYPAIR_PATH || path.join(process.env.HOME || '', '.config/solana/id.json');
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

async function loadKeypair(): Promise<Keypair> {
  const raw = readFileSync(DEFAULT_KEYPAIR, 'utf-8');
  const arr = JSON.parse(raw);
  return Keypair.fromSecretKey(Uint8Array.from(arr));
}

async function main() {
  const supplyArg = process.argv[2] || '1000000'; // raw units
  const decimalsArg = process.argv[3] || '6';
  const supply = Number(supplyArg);
  const decimals = Number(decimalsArg);

  console.log('RPC_URL:', RPC_URL);
  console.log('Keypair path:', DEFAULT_KEYPAIR);
  console.log(`Supply: ${supply} (raw), Decimals: ${decimals}`);

  const keypair = await loadKeypair();
  const connection = new Connection(RPC_URL);

  // Minimal wallet adapter shim
  const wallet = {
    publicKey: keypair.publicKey,
    async sendTransaction(tx: Transaction, conn: Connection) {
      tx.feePayer = keypair.publicKey;
      const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.sign(keypair);
      const sig = await conn.sendRawTransaction(tx.serialize());
      await conn.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      return sig;
    }
  } as any;

  // Airdrop (devnet only)
  if (RPC_URL.includes('devnet')) {
    console.log('Requesting airdrop (devnet)...');
    const sig = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, 'confirmed');
  }

  console.log('\nStep 1: Create mint (with fee)');
  const created = await createMintWithFee({ wallet, supply, decimals });
  console.log('Mint address:', created.mint);
  console.log('Fee tx signature:', created.feeSig);

  console.log('\nStep 2: Lock tokens (simulate escrow)');
  const lockDate = new Date(Date.now() + 60 * 60 * 1000); // 1h future
  const locked = await lockTokensWithFee({
    wallet,
    mintAddress: created.mint,
    amount: Math.floor(supply / 10),
    unlockDate: lockDate
  });
  console.log('Lock tx signature:', locked.lockSig);
  console.log('Escrow address:', locked.escrowAddress);

  console.log('\nStep 3: Burn tokens');
  const burnAmt = Math.floor(supply / 20);
  const burned = await burnTokensWithFee({ wallet, mintAddress: created.mint, amount: burnAmt });
  console.log('Burn tx signature:', burned.burnSig);
  console.log('Amount burned:', burned.amountBurned);
  console.log('Remaining (approx):', burned.remainingBalance);

  console.log('\nSUCCESS: Legacy smoke test completed.');
  console.log('Summary JSON:');
  console.log(JSON.stringify({
    mint: created.mint,
    feeSig: created.feeSig,
    lockSig: locked.lockSig,
    burnSig: burned.burnSig,
    escrow: locked.escrowAddress,
    unlockTimestamp: locked.unlockTimestamp,
    burned: burned.amountBurned
  }, null, 2));
}

main().catch(e => {
  console.error('Smoke test failed:', e);
  process.exit(1);
});
