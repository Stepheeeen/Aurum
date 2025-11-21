use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("AURMhybridPRICE11111111111111111111111111111");

pub mod constants;
pub mod state;
pub mod errors;
pub mod events;

use constants::*;
use state::*;
use errors::*;
use events::*;

#[program]
pub mod aurum_hybrid_pricing {
    use super::*;

    /// Initialize the config account with default pricing
    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.owner = ctx.accounts.owner.key();
        config.create_fee = DEFAULT_CREATE_FEE;
        config.lock_fee = DEFAULT_LOCK_FEE;
        config.burn_fee = DEFAULT_BURN_FEE;
        config.referral_discount = DEFAULT_REFERRAL_DISCOUNT;
        config.referral_rebate = DEFAULT_REFERRAL_REBATE;
        config.premium_anchor_price = DEFAULT_PREMIUM_ANCHOR_PRICE;
        config.bump = ctx.bumps.config;

        let treasury = &mut ctx.accounts.treasury;
        treasury.total_collected = 0;
        treasury.bump = ctx.bumps.treasury;

        msg!("Config initialized with owner: {}", config.owner);
        Ok(())
    }

    /// Update pricing configuration (owner only)
    pub fn update_pricing(
        ctx: Context<UpdatePricing>,
        create_fee: Option<u64>,
        lock_fee: Option<u64>,
        burn_fee: Option<u64>,
        referral_discount: Option<u64>,
        referral_rebate: Option<u64>,
        premium_anchor_price: Option<u64>,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;

        if let Some(fee) = create_fee {
            config.create_fee = fee;
        }
        if let Some(fee) = lock_fee {
            config.lock_fee = fee;
        }
        if let Some(fee) = burn_fee {
            config.burn_fee = fee;
        }
        if let Some(discount) = referral_discount {
            config.referral_discount = discount;
        }
        if let Some(rebate) = referral_rebate {
            config.referral_rebate = rebate;
        }
        if let Some(price) = premium_anchor_price {
            config.premium_anchor_price = price;
        }

        msg!("Pricing updated by owner");
        Ok(())
    }

    /// Create a referral account for a user
    pub fn create_referral(ctx: Context<CreateReferral>) -> Result<()> {
        let referral = &mut ctx.accounts.referral_account;
        let user = ctx.accounts.user.key();

        // Generate referral code from pubkey (first 8 chars of base58)
        let code = user.to_string()[0..8].to_string();

        referral.referrer = user;
        referral.code = code.clone();
        referral.total_referrals = 0;
        referral.rebate_earned = 0;
        referral.bump = ctx.bumps.referral_account;

        msg!("Referral code created: {} for user: {}", code, user);
        Ok(())
    }

    /// Create a token mint with hybrid pricing
    pub fn create_token(
        ctx: Context<CreateToken>,
        decimals: u8,
        referral_code: Option<String>,
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        let clock = Clock::get()?;
        
        // If a referral account is provided, validate PDA and referrer linkage
        if let Some(ref referral) = ctx.accounts.referral_account {
            let (expected_pda, _bump) = Pubkey::find_program_address(
                &[REFERRAL_SEED, referral.referrer.as_ref()],
                ctx.program_id,
            );
            require_keys_eq!(referral.key(), expected_pda, AurumError::InvalidReferralCode);

            let referrer_ai = ctx
                .accounts
                .referrer
                .as_ref()
                .ok_or(AurumError::InvalidReferralCode)?;
            require_keys_eq!(referrer_ai.key(), referral.referrer, AurumError::InvalidReferralCode);
        }
        
        // Calculate fee with referral discount
        let base_fee = config.create_fee;
        let mut final_fee = base_fee;
        let mut referrer_option: Option<Pubkey> = None;

        if let Some(code) = referral_code {
            // Validate and apply referral discount
            if let Some(referral) = &ctx.accounts.referral_account {
                if referral.code == code {
                    final_fee = base_fee
                        .checked_sub(config.referral_discount)
                        .ok_or(AurumError::ArithmeticOverflow)?;
                    referrer_option = Some(referral.referrer);
                    
                    msg!("Referral code applied: {}", code);
                }
            }
        }

        // Transfer fee from user to treasury
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, final_fee)?;

        // Update treasury stats
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_collected = treasury
            .total_collected
            .checked_add(final_fee)
            .ok_or(AurumError::ArithmeticOverflow)?;

        // Handle referral rebate if applicable
        if let (Some(referrer_pubkey), Some(referral)) = (referrer_option, &mut ctx.accounts.referral_account) {
            let rebate = config.referral_rebate;
            
            // Transfer rebate to referrer
            let seeds = &[
                TREASURY_SEED,
                &[treasury.bump],
            ];
            let signer = &[&seeds[..]];
            
            let cpi_context = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.referrer.as_ref().unwrap().to_account_info(),
                },
                signer,
            );
            anchor_lang::system_program::transfer(cpi_context, rebate)?;

            // Update referral stats
            referral.total_referrals = referral
                .total_referrals
                .checked_add(1)
                .ok_or(AurumError::ArithmeticOverflow)?;
            referral.rebate_earned = referral
                .rebate_earned
                .checked_add(rebate)
                .ok_or(AurumError::ArithmeticOverflow)?;

            // Emit referral event
            emit!(ReferralUsed {
                referrer: referrer_pubkey,
                referee: ctx.accounts.payer.key(),
                discount_amount: config.referral_discount,
                rebate_amount: rebate,
                timestamp: clock.unix_timestamp,
            });
        }

        // Emit events
        emit!(FeeCollected {
            payer: ctx.accounts.payer.key(),
            amount: final_fee,
            fee_type: "create".to_string(),
            timestamp: clock.unix_timestamp,
        });

        emit!(TokenCreated {
            mint: ctx.accounts.mint.key(),
            creator: ctx.accounts.payer.key(),
            fee_paid: final_fee,
            timestamp: clock.unix_timestamp,
        });

        msg!("Token created with mint: {}", ctx.accounts.mint.key());
        msg!("Fee collected: {} lamports", final_fee);
        Ok(())
    }

    /// Lock tokens with escrow and time lock
    pub fn lock_tokens(
        ctx: Context<LockTokens>,
        amount: u64,
        unlock_time: i64,
        referral_code: Option<String>,
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        let clock = Clock::get()?;

        // If a referral account is provided, validate PDA and referrer linkage
        if let Some(ref referral) = ctx.accounts.referral_account {
            let (expected_pda, _bump) = Pubkey::find_program_address(
                &[REFERRAL_SEED, referral.referrer.as_ref()],
                ctx.program_id,
            );
            require_keys_eq!(referral.key(), expected_pda, AurumError::InvalidReferralCode);

            let referrer_ai = ctx
                .accounts
                .referrer
                .as_ref()
                .ok_or(AurumError::InvalidReferralCode)?;
            require_keys_eq!(referrer_ai.key(), referral.referrer, AurumError::InvalidReferralCode);
        }

        // Validate unlock time is in the future
        require!(unlock_time > clock.unix_timestamp, AurumError::InvalidUnlockTime);

        // Calculate fee with referral discount
        let base_fee = config.lock_fee;
        let mut final_fee = base_fee;
        let mut referrer_option: Option<Pubkey> = None;

        if let Some(code) = referral_code {
            if let Some(referral) = &ctx.accounts.referral_account {
                if referral.code == code {
                    final_fee = base_fee
                        .checked_sub(config.referral_discount)
                        .ok_or(AurumError::ArithmeticOverflow)?;
                    referrer_option = Some(referral.referrer);
                }
            }
        }

        // Transfer fee to treasury
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.locker.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, final_fee)?;

        // Update treasury
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_collected = treasury
            .total_collected
            .checked_add(final_fee)
            .ok_or(AurumError::ArithmeticOverflow)?;

        // Handle referral rebate
        if let (Some(referrer_pubkey), Some(referral)) = (referrer_option, &mut ctx.accounts.referral_account) {
            let rebate = config.referral_rebate;
            
            let seeds = &[TREASURY_SEED, &[treasury.bump]];
            let signer = &[&seeds[..]];
            
            let cpi_context = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.referrer.as_ref().unwrap().to_account_info(),
                },
                signer,
            );
            anchor_lang::system_program::transfer(cpi_context, rebate)?;

            referral.total_referrals = referral.total_referrals.checked_add(1).ok_or(AurumError::ArithmeticOverflow)?;
            referral.rebate_earned = referral.rebate_earned.checked_add(rebate).ok_or(AurumError::ArithmeticOverflow)?;

            emit!(ReferralUsed {
                referrer: referrer_pubkey,
                referee: ctx.accounts.locker.key(),
                discount_amount: config.referral_discount,
                rebate_amount: rebate,
                timestamp: clock.unix_timestamp,
            });
        }

        // Transfer tokens from user to escrow
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.locker.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Emit events
        emit!(FeeCollected {
            payer: ctx.accounts.locker.key(),
            amount: final_fee,
            fee_type: "lock".to_string(),
            timestamp: clock.unix_timestamp,
        });

        emit!(TokensLocked {
            mint: ctx.accounts.mint.key(),
            locker: ctx.accounts.locker.key(),
            amount,
            unlock_time,
            fee_paid: final_fee,
            timestamp: clock.unix_timestamp,
        });

        msg!("Tokens locked: {} until {}", amount, unlock_time);
        Ok(())
    }

    /// Burn tokens permanently
    pub fn burn_tokens(
        ctx: Context<BurnTokens>,
        amount: u64,
        referral_code: Option<String>,
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        let clock = Clock::get()?;

        // If a referral account is provided, validate PDA and referrer linkage
        if let Some(ref referral) = ctx.accounts.referral_account {
            let (expected_pda, _bump) = Pubkey::find_program_address(
                &[REFERRAL_SEED, referral.referrer.as_ref()],
                ctx.program_id,
            );
            require_keys_eq!(referral.key(), expected_pda, AurumError::InvalidReferralCode);

            let referrer_ai = ctx
                .accounts
                .referrer
                .as_ref()
                .ok_or(AurumError::InvalidReferralCode)?;
            require_keys_eq!(referrer_ai.key(), referral.referrer, AurumError::InvalidReferralCode);
        }

        // Calculate fee with referral discount
        let base_fee = config.burn_fee;
        let mut final_fee = base_fee;
        let mut referrer_option: Option<Pubkey> = None;

        if let Some(code) = referral_code {
            if let Some(referral) = &ctx.accounts.referral_account {
                if referral.code == code {
                    final_fee = base_fee
                        .checked_sub(config.referral_discount)
                        .ok_or(AurumError::ArithmeticOverflow)?;
                    referrer_option = Some(referral.referrer);
                }
            }
        }

        // Transfer fee to treasury
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.burner.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, final_fee)?;

        // Update treasury
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_collected = treasury
            .total_collected
            .checked_add(final_fee)
            .ok_or(AurumError::ArithmeticOverflow)?;

        // Handle referral rebate
        if let (Some(referrer_pubkey), Some(referral)) = (referrer_option, &mut ctx.accounts.referral_account) {
            let rebate = config.referral_rebate;
            
            let seeds = &[TREASURY_SEED, &[treasury.bump]];
            let signer = &[&seeds[..]];
            
            let cpi_context = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.referrer.as_ref().unwrap().to_account_info(),
                },
                signer,
            );
            anchor_lang::system_program::transfer(cpi_context, rebate)?;

            referral.total_referrals = referral.total_referrals.checked_add(1).ok_or(AurumError::ArithmeticOverflow)?;
            referral.rebate_earned = referral.rebate_earned.checked_add(rebate).ok_or(AurumError::ArithmeticOverflow)?;

            emit!(ReferralUsed {
                referrer: referrer_pubkey,
                referee: ctx.accounts.burner.key(),
                discount_amount: config.referral_discount,
                rebate_amount: rebate,
                timestamp: clock.unix_timestamp,
            });
        }

        // Burn tokens
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.burner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, amount)?;

        // Emit events
        emit!(FeeCollected {
            payer: ctx.accounts.burner.key(),
            amount: final_fee,
            fee_type: "burn".to_string(),
            timestamp: clock.unix_timestamp,
        });

        emit!(TokensBurned {
            mint: ctx.accounts.mint.key(),
            burner: ctx.accounts.burner.key(),
            amount,
            fee_paid: final_fee,
            timestamp: clock.unix_timestamp,
        });

        msg!("Tokens burned: {}", amount);
        Ok(())
    }

    /// Withdraw accumulated fees (owner only)
    pub fn withdraw_fees(ctx: Context<WithdrawFees>, amount: u64) -> Result<()> {
        let clock = Clock::get()?;
        let treasury = &ctx.accounts.treasury;

        // Transfer SOL from treasury to owner
        let seeds = &[TREASURY_SEED, &[treasury.bump]];
        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.treasury.to_account_info(),
                to: ctx.accounts.owner.to_account_info(),
            },
            signer,
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        emit!(FeesWithdrawn {
            recipient: ctx.accounts.owner.key(),
            amount,
            timestamp: clock.unix_timestamp,
        });

        msg!("Fees withdrawn: {} lamports to {}", amount, ctx.accounts.owner.key());
        Ok(())
    }
}

// Context structs

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = owner,
        space = Config::SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = owner,
        space = Treasury::SPACE,
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePricing<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = owner @ AurumError::Unauthorized
    )]
    pub config: Account<'info, Config>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateReferral<'info> {
    #[account(
        init,
        payer = user,
        space = ReferralAccount::SPACE,
        seeds = [REFERRAL_SEED, user.key().as_ref()],
        bump
    )]
    pub referral_account: Account<'info, ReferralAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(decimals: u8)]
pub struct CreateToken<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = decimals,
        mint::authority = payer,
    )]
    pub mint: Account<'info, Mint>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, Config>,

    #[account(mut, seeds = [TREASURY_SEED], bump = treasury.bump)]
    pub treasury: Account<'info, Treasury>,

    #[account(mut)]
    pub referral_account: Option<Account<'info, ReferralAccount>>,

    /// CHECK: Referrer to receive rebate
    #[account(mut)]
    pub referrer: Option<AccountInfo<'info>>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct LockTokens<'info> {
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = locker
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = locker,
        associated_token::mint = mint,
        associated_token::authority = treasury
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, Config>,

    #[account(mut, seeds = [TREASURY_SEED], bump = treasury.bump)]
    pub treasury: Account<'info, Treasury>,

    #[account(mut)]
    pub referral_account: Option<Account<'info, ReferralAccount>>,

    /// CHECK: Referrer to receive rebate
    #[account(mut)]
    pub referrer: Option<AccountInfo<'info>>,

    #[account(mut)]
    pub locker: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = burner
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, Config>,

    #[account(mut, seeds = [TREASURY_SEED], bump = treasury.bump)]
    pub treasury: Account<'info, Treasury>,

    #[account(mut)]
    pub referral_account: Option<Account<'info, ReferralAccount>>,

    /// CHECK: Referrer to receive rebate
    #[account(mut)]
    pub referrer: Option<AccountInfo<'info>>,

    #[account(mut)]
    pub burner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(seeds = [CONFIG_SEED], bump = config.bump, has_one = owner @ AurumError::Unauthorized)]
    pub config: Account<'info, Config>,

    #[account(mut, seeds = [TREASURY_SEED], bump = treasury.bump)]
    pub treasury: Account<'info, Treasury>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
