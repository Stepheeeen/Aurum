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

// Minimal mode: remove external fee wallet dependency; use optional fee (default zero)
import { RPC_URL } from "./config";

const connection = new Connection(RPC_URL);

export async function createMintBasic({
  wallet,
  supply,
  decimals
}: {
  wallet: any;
  supply: number;
  decimals: number;
}) {
  // Create Mint
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

  return { mint: mint.toBase58() };
}

// Lock tokens function
export async function lockTokensBasic({
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
  // Warning: client-side escrow (not enforceable unlock). Tokens moved to a generated keypair.
  const escrowKeypair = Keypair.generate();
  const mint = new PublicKey(mintAddress);

  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    wallet.publicKey
  );

  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    escrowKeypair.publicKey
  );

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
    lockSig,
    escrowAddress: escrowKeypair.publicKey.toBase58(),
    unlockTimestamp: unlockDate.getTime(),
    amount
  };
}

// Burn tokens function
export async function burnTokensBasic({
  wallet,
  mintAddress,
  amount
}: {
  wallet: any;
  mintAddress: string;
  amount: number;
}) {
  const mint = new PublicKey(mintAddress);
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    wallet.publicKey
  );
  const accountInfo = await getAccount(connection, tokenAccount.address);
  const balanceBefore = Number(accountInfo.amount);
  const burnSig = await splBurn(
    connection,
    wallet as any,
    tokenAccount.address,
    mint,
    wallet.publicKey,
    amount
  );
  return {
    burnSig,
    amountBurned: amount,
    remainingBalance: balanceBefore - amount
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
