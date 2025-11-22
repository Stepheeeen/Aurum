#!/usr/bin/env bash
# Deploy Anchor program and wire frontend env automatically.
# Usage: ./scripts/deploy-anchor.sh [cluster] [program_keypair_path]
# cluster defaults to devnet. program_keypair_path optional (Anchor will create one if absent).
set -euo pipefail

CLUSTER="${1:-devnet}"
KEYPAIR_PATH="${2:-}"
PROGRAM_NAME="aurum_hybrid_pricing"
ANCHOR_TOML="Anchor.toml"
ENV_FILE=".env.local"
IDL_SRC="target/idl/${PROGRAM_NAME}.json"
IDL_DST="src/idl/${PROGRAM_NAME}.json"

info() { echo -e "\033[1;34m[INFO]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERROR]\033[0m $*"; }

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "Missing required binary: $1"; exit 1; fi
}

info "Checking required binaries..."
require_bin solana
require_bin anchor
require_bin sed

if [[ -n "${KEYPAIR_PATH}" ]]; then
  if [[ ! -f "${KEYPAIR_PATH}" ]]; then
    info "Generating program keypair at ${KEYPAIR_PATH}"
    solana-keygen new -o "${KEYPAIR_PATH}" --no-bip39-passphrase --force
  else
    info "Using existing program keypair at ${KEYPAIR_PATH}";
  fi
  export ANCHOR_WALLET="${KEYPAIR_PATH}" # override if you want deployer different from program keypair
fi

info "Cluster: ${CLUSTER}"

# Ensure Anchor.toml has program entry; placeholder may exist.
if ! grep -q "[programs.${CLUSTER}]" "${ANCHOR_TOML}"; then
  err "Cluster section [programs.${CLUSTER}] missing in ${ANCHOR_TOML}"; exit 1; fi

info "Building program..."
anchor build

if [[ ! -f "${IDL_SRC}" ]]; then
  err "IDL not found at ${IDL_SRC}"; exit 1; fi

info "Deploying program (this may take a minute)..."
anchor deploy --provider.cluster "${CLUSTER}" || { err "Anchor deploy failed"; exit 1; }

# Extract program id from Anchor.toml after deploy
PROGRAM_ID=$(grep -A1 "[programs.${CLUSTER}]" "${ANCHOR_TOML}" | grep "${PROGRAM_NAME}" | awk -F'=' '{print $2}' | tr -d ' "')
if [[ -z "${PROGRAM_ID}" ]]; then
  err "Could not parse program id from ${ANCHOR_TOML}"; exit 1; fi
info "Program ID: ${PROGRAM_ID}"

# Copy IDL into frontend
info "Copying IDL to ${IDL_DST}"
cp "${IDL_SRC}" "${IDL_DST}"

# Patch .env.local
if [[ -f "${ENV_FILE}" ]]; then
  if grep -q "NEXT_PUBLIC_AURUM_PROGRAM_ID" "${ENV_FILE}"; then
    sed -i '' "s#NEXT_PUBLIC_AURUM_PROGRAM_ID=.*#NEXT_PUBLIC_AURUM_PROGRAM_ID=${PROGRAM_ID}#" "${ENV_FILE}" || { err "Failed to patch ${ENV_FILE}"; exit 1; }
  else
    echo "NEXT_PUBLIC_AURUM_PROGRAM_ID=${PROGRAM_ID}" >> "${ENV_FILE}";
  fi
  if ! grep -q "NEXT_PUBLIC_USE_ANCHOR" "${ENV_FILE}"; then
    echo "NEXT_PUBLIC_USE_ANCHOR=1" >> "${ENV_FILE}"
  else
    sed -i '' "s#NEXT_PUBLIC_USE_ANCHOR=.*#NEXT_PUBLIC_USE_ANCHOR=1#" "${ENV_FILE}" || warn "Could not set NEXT_PUBLIC_USE_ANCHOR=1 (manual edit)."
  fi
  info "Updated ${ENV_FILE} with program ID and enabled Anchor mode."
else
  warn "${ENV_FILE} not found; create it and add NEXT_PUBLIC_AURUM_PROGRAM_ID=${PROGRAM_ID}";
fi

info "Verifying program on chain..."
solana program show "${PROGRAM_ID}" || warn "Program show failed—ensure RPC/network correct." 

info "Done. Restart your Next.js dev server to apply env changes."
