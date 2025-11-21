use anchor_lang::prelude::*;

/// Program configuration PDA seed
pub const CONFIG_SEED: &[u8] = b"config";

/// Treasury PDA seed for fee collection
pub const TREASURY_SEED: &[u8] = b"treasury";

/// Referral account PDA seed
pub const REFERRAL_SEED: &[u8] = b"referral";

/// Default pricing in lamports
pub const DEFAULT_CREATE_FEE: u64 = 600_000_000; // 0.6 SOL
pub const DEFAULT_LOCK_FEE: u64 = 300_000_000; // 0.3 SOL
pub const DEFAULT_BURN_FEE: u64 = 150_000_000; // 0.15 SOL
pub const DEFAULT_REFERRAL_DISCOUNT: u64 = 100_000_000; // 0.1 SOL
pub const DEFAULT_REFERRAL_REBATE: u64 = 50_000_000; // 0.05 SOL
pub const DEFAULT_PREMIUM_ANCHOR_PRICE: u64 = 1_200_000_000; // 1.2 SOL (display only)

/// Referral code length
pub const REFERRAL_CODE_LENGTH: usize = 8;
