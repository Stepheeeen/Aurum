/*
 * Plain JS legacy smoke test (no TypeScript import issues)
 * Steps: fee+mint, lock (transfer), burn.
 * Usage: node scripts/smoke-legacy.js [supply] [decimals]
 * Env:
 *   KEYPAIR_PATH=~/.config/solana/id.json
 *   RPC_URL=https://api.devnet.solana.com (or mainnet)
 *   FEE_WALLET=<pubkey> (fallback to NEXT_PUBLIC_FEE_WALLET)
 */
const fs = require('fs');
const path = require('path');
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  createTransferInstruction,
  burn: splBurn,
  TOKEN_PROGRAM_ID
} = require('@solana/spl-token');

const supplyArg = process.argv[2] || '1000000';
const decimalsArg = process.argv[3] || '6';
const SUPPLY = Number(supplyArg);
const DECIMALS = Number(decimalsArg);

const KEYPAIR_PATH = process.env.KEYPAIR_PATH || path.join(process.env.HOME || '', '.config/solana/id.json');
const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const FEE_WALLET = process.env.FEE_WALLET || process.env.NEXT_PUBLIC_FEE_WALLET || '11111111111111111111111111111111';

function loadKeypair() {
  const raw = fs.readFileSync(KEYPAIR_PATH, 'utf-8');
  const arr = JSON.parse(raw);
  return Keypair.fromSecretKey(Uint8Array.from(arr));
}

async function main() {
  console.log('RPC_URL:', RPC_URL);
  console.log('Keypair path:', KEYPAIR_PATH);
  console.log('Fee wallet:', FEE_WALLET);
  console.log(`Supply(raw): ${SUPPLY} Decimals: ${DECIMALS}`);

  const kp = loadKeypair();
  const connection = new Connection(RPC_URL);

  // Fund on devnet
  if (RPC_URL.includes('devnet')) {
    console.log('Airdrop 2 SOL...');
    const sig = await connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, 'confirmed');
    // Wait for balance to reflect
    let retries = 12;
    while (retries-- > 0) {
      const bal = await connection.getBalance(kp.publicKey);
      if (bal > 0) { console.log('Balance after airdrop:', bal); break; }
      await new Promise(r=>setTimeout(r, 1000));
    }
  }

  const wallet = {
    publicKey: kp.publicKey,
    async sendTransaction(tx) {
      tx.feePayer = kp.publicKey;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.sign(kp);
      const sig = await connection.sendRawTransaction(tx.serialize());
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      return sig;
    }
  };

  // STEP 1: Fee + Mint
  const feeLamports = 0.6 * LAMPORTS_PER_SOL;
  const feeTx = new Transaction().add(SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: new PublicKey(FEE_WALLET),
    lamports: feeLamports
  }));
  const feeSig = await wallet.sendTransaction(feeTx);
  console.log('Fee tx signature:', feeSig);

  const mint = await createMint(connection, kp, kp.publicKey, kp.publicKey, DECIMALS);
  const ata = await getOrCreateAssociatedTokenAccount(connection, kp, mint, kp.publicKey);
  await mintTo(connection, kp, mint, ata.address, kp.publicKey, SUPPLY);
  console.log('Mint address:', mint.toBase58());

  // STEP 2: Lock (transfer subset to escrow)
  const lockFeeLamports = 0.3 * LAMPORTS_PER_SOL;
  const lockFeeTx = new Transaction().add(SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: new PublicKey(FEE_WALLET),
    lamports: lockFeeLamports
  }));
  const lockFeeSig = await wallet.sendTransaction(lockFeeTx);

  const escrow = Keypair.generate();
  const escrowAta = await getOrCreateAssociatedTokenAccount(connection, kp, mint, escrow.publicKey);
  const transferAmt = Math.floor(SUPPLY / 10);
  const transferIx = createTransferInstruction(
    ata.address,
    escrowAta.address,
    wallet.publicKey,
    BigInt(transferAmt),
    [],
    TOKEN_PROGRAM_ID
  );
  const lockTx = new Transaction().add(transferIx);
  const lockSig = await wallet.sendTransaction(lockTx);
  console.log('Lock transfer signature:', lockSig);
  console.log('Escrow account:', escrow.publicKey.toBase58());

  // STEP 3: Burn
  const burnFeeLamports = 0.15 * LAMPORTS_PER_SOL;
  const burnFeeTx = new Transaction().add(SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: new PublicKey(FEE_WALLET),
    lamports: burnFeeLamports
  }));
  const burnFeeSig = await wallet.sendTransaction(burnFeeTx);

  const accountInfo = await getAccount(connection, ata.address);
  const balanceBefore = Number(accountInfo.amount);
  const burnAmt = Math.floor(SUPPLY / 20);
  const burnSig = await splBurn(connection, kp, ata.address, mint, kp.publicKey, burnAmt);
  console.log('Burn signature:', burnSig);
  console.log('Burned amount:', burnAmt);
  console.log('Balance before:', balanceBefore);
  console.log('Estimated after:', balanceBefore - burnAmt);

  const summary = {
    mint: mint.toBase58(),
    feeSig,
    lockFeeSig,
    lockSig,
    burnFeeSig,
    burnSig,
    escrow: escrow.publicKey.toBase58(),
    supply: SUPPLY,
    transferAmt,
    burnAmt
  };
  console.log('\nSUMMARY JSON');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(e => {
  console.error('Smoke test error:', e);
  process.exit(1);
});
