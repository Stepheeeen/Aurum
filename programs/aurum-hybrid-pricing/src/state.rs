use anchor_lang::prelude::*;

#[account]
pub struct Config {
    /// Program owner who can update pricing
    pub owner: Pubkey,
    /// Create token fee in lamports
    pub create_fee: u64,
    /// Lock tokens fee in lamports
    pub lock_fee: u64,
    /// Burn tokens fee in lamports
    pub burn_fee: u64,
    /// Referral discount for users
    pub referral_discount: u64,
    /// Referral rebate for referrers
    pub referral_rebate: u64,
    /// Premium anchor price for display
    pub premium_anchor_price: u64,
    /// PDA bump
    pub bump: u8,
}

impl Config {
    /// Space needed for Config account
    pub const SPACE: usize = 8 + // discriminator
        32 + // owner
        8 + // create_fee
        8 + // lock_fee
        8 + // burn_fee
        8 + // referral_discount
        8 + // referral_rebate
        8 + // premium_anchor_price
        1; // bump
}

#[account]
pub struct ReferralAccount {
    /// The wallet that generated this referral code
    pub referrer: Pubkey,
    /// Referral code (8-10 characters derived from pubkey)
    pub code: String,
    /// Total number of users who used this code
    pub total_referrals: u64,
    /// Total rebate earned in lamports
    pub rebate_earned: u64,
    /// PDA bump
    pub bump: u8,
}

impl ReferralAccount {
    /// Space needed for ReferralAccount
    pub const SPACE: usize = 8 + // discriminator
        32 + // referrer
        4 + 10 + // code (String with max 10 chars)
        8 + // total_referrals
        8 + // rebate_earned
        1; // bump
}

#[account]
pub struct Treasury {
    /// Total fees collected
    pub total_collected: u64,
    /// PDA bump
    pub bump: u8,
}

impl Treasury {
    /// Space needed for Treasury account
    pub const SPACE: usize = 8 + // discriminator
        8 + // total_collected
        1; // bump
}
