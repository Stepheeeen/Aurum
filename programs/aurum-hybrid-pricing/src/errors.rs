use anchor_lang::prelude::*;

#[error_code]
pub enum AurumError {
    #[msg("Insufficient fee payment")]
    InsufficientFee,
    
    #[msg("Invalid referral code")]
    InvalidReferralCode,
    
    #[msg("Unauthorized access - only owner can perform this action")]
    Unauthorized,
    
    #[msg("Invalid unlock time - must be in the future")]
    InvalidUnlockTime,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    
    #[msg("Invalid fee amount")]
    InvalidFeeAmount,
}
