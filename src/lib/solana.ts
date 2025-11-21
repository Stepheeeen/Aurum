import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  createTransferInstruction,
  burn as splBurn,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

import { FEE_WALLET, RPC_URL } from "./config";

const connection = new Connection(RPC_URL);

export async function createMintWithFee({
  wallet,
  supply,
  decimals
}: {
  wallet: any;
  supply: number;
  decimals: number;
}) {
  const feeLamports = 0.6 * LAMPORTS_PER_SOL; // Align with on-chain base fee

  // Step 1: Transfer Fee
  const feeTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(FEE_WALLET),
      lamports: feeLamports
    })
  );

  const feeSig = await wallet.sendTransaction(feeTx, connection);
  await connection.confirmTransaction(feeSig, "confirmed");

  // Step 2: Create Mint
  const mint = await createMint(
    connection,
    wallet as any,
    wallet.publicKey,
    wallet.publicKey,
    decimals
  );

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    wallet.publicKey
  );

  await mintTo(connection, wallet as any, mint, ata.address, wallet.publicKey, supply);

  return { mint: mint.toBase58(), feeSig };
}

// Lock tokens function
export async function lockTokensWithFee({
  wallet,
  mintAddress,
  amount,
  unlockDate
}: {
  wallet: any;
  mintAddress: string;
  amount: number;
  unlockDate: Date;
}) {
  const feeLamports = 0.3 * LAMPORTS_PER_SOL; // Align with on-chain base fee

  // Step 1: Transfer Fee
  const feeTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(FEE_WALLET),
      lamports: feeLamports
    })
  );

  const feeSig = await wallet.sendTransaction(feeTx, connection);
  await connection.confirmTransaction(feeSig, "confirmed");

  // Step 2: Lock tokens (transfer to escrow/PDA)
  // For MVP: Create a new keypair as escrow (in production, use PDA)
  const escrowKeypair = Keypair.generate();
  const mint = new PublicKey(mintAddress);

  // Get user's token account
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    wallet.publicKey
  );

  // Create escrow token account
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    escrowKeypair.publicKey
  );

  // Transfer tokens to escrow
  const transferIx = createTransferInstruction(
    fromTokenAccount.address,
    toTokenAccount.address,
    wallet.publicKey,
    BigInt(amount),
    [],
    TOKEN_PROGRAM_ID
  );

  const transferTx = new Transaction().add(transferIx);

  const lockSig = await wallet.sendTransaction(transferTx, connection);
  await connection.confirmTransaction(lockSig, "confirmed");

  return {
    feeSig,
    lockSig,
    escrowAddress: escrowKeypair.publicKey.toBase58(),
    unlockTimestamp: unlockDate.getTime(),
    amount
  };
}

// Burn tokens function
export async function burnTokensWithFee({
  wallet,
  mintAddress,
  amount
}: {
  wallet: any;
  mintAddress: string;
  amount: number;
}) {
  const feeLamports = 0.15 * LAMPORTS_PER_SOL; // Align with on-chain base fee

  // Step 1: Transfer Fee
  const feeTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(FEE_WALLET),
      lamports: feeLamports
    })
  );

  const feeSig = await wallet.sendTransaction(feeTx, connection);
  await connection.confirmTransaction(feeSig, "confirmed");

  // Step 2: Burn tokens
  const mint = new PublicKey(mintAddress);
  
  // Get user's token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    wallet.publicKey
  );

  // Get balance before burn
  const accountInfo = await getAccount(connection, tokenAccount.address);
  const balanceBefore = Number(accountInfo.amount);

  // Burn tokens
  const burnSig = await splBurn(
    connection,
    wallet as any,
    tokenAccount.address,
    mint,
    wallet.publicKey,
    amount
  );

  const balanceAfter = balanceBefore - amount;

  return {
    feeSig,
    burnSig,
    amountBurned: amount,
    remainingBalance: balanceAfter
  };
}

// Get token balance
export async function getTokenBalance({
  connection,
  mintAddress,
  ownerAddress
}: {
  connection: Connection;
  mintAddress: string;
  ownerAddress: string;
}) {
  try {
    const mint = new PublicKey(mintAddress);
    const owner = new PublicKey(ownerAddress);

    const resp = await connection.getParsedTokenAccountsByOwner(owner, { mint });
    let total = 0;
    for (const { account } of resp.value) {
      const parsed: any = account.data;
      const amtStr = parsed.parsed.info.tokenAmount.amount as string;
      total += Number(amtStr);
    }
    return total;
  } catch (error) {
    return 0;
  }
}
