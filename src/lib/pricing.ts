import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 * AURUM Pricing Library
 * 
 * This module provides helper functions for interacting with the AURUM Anchor program.
 * 
 * NOTE: @coral-xyz/anchor is not imported here to avoid errors before installation.
 * Once you deploy the Anchor program, install it with:
 *   npm install @coral-xyz/anchor
 * 
 * Then you can import: import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
 * And use the IDL for full type safety.
 */

// Anchor types - will be available after installing @coral-xyz/anchor
type Program = any;
type AnchorProvider = any;
type BN = any;

// Program ID - will be updated after deployment
export const AURUM_PROGRAM_ID = new PublicKey('AURMhybridPRICE11111111111111111111111111111');

// PDA Seeds
export const CONFIG_SEED = Buffer.from('config');
export const TREASURY_SEED = Buffer.from('treasury');
export const REFERRAL_SEED = Buffer.from('referral');

/**
 * Find Config PDA
 */
export async function findConfigPDA(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [CONFIG_SEED],
    AURUM_PROGRAM_ID
  );
}

/**
 * Find Treasury PDA
 */
export async function findTreasuryPDA(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [TREASURY_SEED],
    AURUM_PROGRAM_ID
  );
}

/**
 * Find Referral PDA for a user
 */
export async function findReferralPDA(userPubkey: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [REFERRAL_SEED, userPubkey.toBuffer()],
    AURUM_PROGRAM_ID
  );
}

/**
 * Read u64 from buffer (little endian)
 */
function readU64LE(buffer: Buffer, offset: number): number {
  return Number(buffer.readBigUInt64LE(offset));
}

/**
 * Fetch pricing configuration from on-chain
 */
export async function fetchPricingConfig(connection: Connection): Promise<PricingConfig | null> {
  try {
    const [configPDA] = await findConfigPDA();
    const accountInfo = await connection.getAccountInfo(configPDA);
    
    if (!accountInfo) {
      console.error('Config account not found');
      return null;
    }

    // Parse the account data (simplified - would use IDL in production)
    const data = accountInfo.data;
    
    // Skip discriminator (8 bytes) and parse account fields
    // This is a simplified version - use Anchor's IDL parser in production
    const createFee = Number(readU64LE(data, 40));
    const lockFee = Number(readU64LE(data, 48));
    const burnFee = Number(readU64LE(data, 56));
    const referralDiscount = Number(readU64LE(data, 64));
    const referralRebate = Number(readU64LE(data, 72));
    const premiumAnchorPrice = Number(readU64LE(data, 80));

    return {
      createFee,
      lockFee,
      burnFee,
      referralDiscount,
      referralRebate,
      premiumAnchorPrice,
    };
  } catch (error) {
    console.error('Error fetching pricing config:', error);
    return null;
  }
}

/**
 * Calculate final fee with referral discount
 */
export function calculateFinalFee(
  baseFee: number,
  referralDiscount: number,
  hasReferralCode: boolean
): number {
  if (hasReferralCode) {
    return Math.max(0, baseFee - referralDiscount);
  }
  return baseFee;
}

/**
 * Format lamports to SOL
 */
export function lamportsToSOL(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(2);
}

/**
 * Format SOL to lamports
 */
export function SOLToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000);
}

/**
 * Get referral code from URL query parameters
 */
export function getReferralCodeFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

/**
 * Generate referral link for a user
 */
export function generateReferralLink(referralCode: string): string {
  if (typeof window === 'undefined') return '';
  
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${referralCode}`;
}

/**
 * Fetch referral account data
 */
export async function fetchReferralAccount(
  connection: Connection,
  userPubkey: PublicKey
): Promise<ReferralAccountData | null> {
  try {
    const [referralPDA] = await findReferralPDA(userPubkey);
    const accountInfo = await connection.getAccountInfo(referralPDA);
    
    if (!accountInfo) {
      return null;
    }

    // Parse the account data (simplified)
    const data = accountInfo.data;

    // Layout: discriminator(8) | referrer(32) | code_len(4) | code_bytes(len) | total_referrals(8) | rebate_earned(8) | bump(1)
    const referrer = new PublicKey(data.slice(8, 40));
    let offset = 40;
    const codeLen = data.readUInt32LE(offset);
    offset += 4;
    const code = data.slice(offset, offset + codeLen).toString('utf8');
    offset += codeLen;
    const totalReferrals = Number(readU64LE(data, offset));
    offset += 8;
    const rebateEarned = Number(readU64LE(data, offset));

    return {
      referrer,
      code,
      totalReferrals,
      rebateEarned,
    };
  } catch (error) {
    console.error('Error fetching referral account:', error);
    return null;
  }
}

/**
 * Create referral account for a user
 */
export async function createReferralAccount(
  program: Program,
  userPubkey: PublicKey
): Promise<string> {
  const [referralPDA] = await findReferralPDA(userPubkey);
  
  const tx = await program.methods
    .createReferral()
    .accounts({
      referralAccount: referralPDA,
      user: userPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  return tx;
}

// Type definitions

export interface PricingConfig {
  createFee: number;
  lockFee: number;
  burnFee: number;
  referralDiscount: number;
  referralRebate: number;
  premiumAnchorPrice: number;
}

export interface ReferralAccountData {
  referrer: PublicKey;
  code: string;
  totalReferrals: number;
  rebateEarned: number;
}

export interface FeeBreakdown {
  baseFee: number;
  discount: number;
  finalFee: number;
  rebateToReferrer: number;
  premiumPrice: number;
}

/**
 * Calculate complete fee breakdown
 */
export function calculateFeeBreakdown(
  baseFee: number,
  referralDiscount: number,
  referralRebate: number,
  premiumPrice: number,
  hasReferralCode: boolean
): FeeBreakdown {
  const discount = hasReferralCode ? referralDiscount : 0;
  const finalFee = baseFee - discount;
  const rebateToReferrer = hasReferralCode ? referralRebate : 0;

  return {
    baseFee,
    discount,
    finalFee,
    rebateToReferrer,
    premiumPrice,
  };
}
