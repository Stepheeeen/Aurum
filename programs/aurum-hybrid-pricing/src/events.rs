use anchor_lang::prelude::*;

#[event]
pub struct FeeCollected {
    pub payer: Pubkey,
    pub amount: u64,
    pub fee_type: String,
    pub timestamp: i64,
}

#[event]
pub struct ReferralUsed {
    pub referrer: Pubkey,
    pub referee: Pubkey,
    pub discount_amount: u64,
    pub rebate_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokenCreated {
    pub mint: Pubkey,
    pub creator: Pubkey,
    pub fee_paid: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensLocked {
    pub mint: Pubkey,
    pub locker: Pubkey,
    pub amount: u64,
    pub unlock_time: i64,
    pub fee_paid: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensBurned {
    pub mint: Pubkey,
    pub burner: Pubkey,
    pub amount: u64,
    pub fee_paid: u64,
    pub timestamp: i64,
}

#[event]
pub struct FeesWithdrawn {
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
