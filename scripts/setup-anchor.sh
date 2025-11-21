#!/bin/bash

# AURUM Anchor Program Setup Script
# This script installs all necessary dependencies for Anchor development

set -e

echo "========================================="
echo "AURUM Anchor Program Setup"
echo "========================================="
echo ""

# Check if Rust is installed
if command -v rustc &> /dev/null; then
    echo "✓ Rust is already installed ($(rustc --version))"
else
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo "✓ Rust installed successfully"
fi

# Check if Solana CLI is installed
if command -v solana &> /dev/null; then
    echo "✓ Solana CLI is already installed ($(solana --version))"
else
    echo "Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo "✓ Solana CLI installed successfully"
fi

# Check if Anchor is installed
if command -v anchor &> /dev/null; then
    echo "✓ Anchor is already installed ($(anchor --version))"
else
    echo "Installing Anchor CLI..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
    echo "✓ Anchor CLI installed successfully"
fi

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Configure Solana CLI:"
echo "   solana config set --url devnet"
echo "   solana-keygen new  # If you don't have a keypair"
echo ""
echo "2. Build the Anchor program:"
echo "   cd /Users/admin/Github/solana-token-deployer"
echo "   anchor build"
echo ""
echo "3. Update program IDs in:"
echo "   - programs/aurum-hybrid-pricing/src/lib.rs"
echo "   - Anchor.toml"
echo "   - src/lib/pricing.ts"
echo ""
echo "4. Deploy to devnet:"
echo "   anchor deploy"
echo ""
echo "5. Initialize the program:"
echo "   anchor run initialize"
echo ""
echo "Happy building! 🚀"
