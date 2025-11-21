type Network = 'mainnet' | 'devnet' | 'testnet';

export const NETWORK: Network = (process.env.NEXT_PUBLIC_NETWORK as Network) || 'devnet';

export const RPC_URL = (() => {
	switch (NETWORK) {
		case 'mainnet':
			return 'https://api.mainnet-beta.solana.com';
		case 'testnet':
			return 'https://api.testnet.solana.com';
		default:
			return 'https://api.devnet.solana.com';
	}
})();

export const EXPLORER_CLUSTER_SUFFIX = NETWORK === 'mainnet' ? '' : `?cluster=${NETWORK}`;

export const FEE_WALLET = process.env.NEXT_PUBLIC_FEE_WALLET || '';