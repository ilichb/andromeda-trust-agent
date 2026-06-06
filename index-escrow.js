/**
 * Entry point for Category 1 (Escrow + Sentinel).
 *
 * Initializes the agent with paymentMode='escrow' for on-chain escrow payments
 * via SAP SDK, plus Synapse Sentinel risk assessment.
 *
 * Usage:
 *   npm run cat1 "your task description"
 *   DRY_RUN=true npm run cat1 "test"   # simulate without real transactions
 *
 * @category Entry
 */

require('dotenv').config();
const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const AutonomousAgent = require('./src/workflow/agent');

// ── Validate required env vars ──
const required = ['ACE_API_KEY', 'KEYPAIR_PATH', 'EVM_PRIVATE_KEY'];
for (const key of required) {
    if (!process.env[key]) {
        console.error(`❌ Falta variable de entorno: ${key}`);
        process.exit(1);
    }
}

async function main() {
    const keypairPath = process.env.KEYPAIR_PATH;
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const wallet = Keypair.fromSecretKey(Uint8Array.from(keypairData));

    const evmPrivateKey = process.env.EVM_PRIVATE_KEY;
    const formattedKey = evmPrivateKey.startsWith('0x') ? evmPrivateKey : `0x${evmPrivateKey}`;

    const agent = new AutonomousAgent({
        aceApiKey: process.env.ACE_API_KEY,
        agentWallet: 'GUjhtFcxBEpi1TEzzXvXNgkvgggrfgGvobLBxXcLBBWr', // SAP mainnet wallet
        evmPrivateKey: formattedKey,
        keypairPath: keypairPath,
        rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
        paymentMode: 'escrow',
        dryRun: process.env.DRY_RUN === 'true',
    });

    const task = process.argv[2] || 'Generate a security report for Solana DeFi protocols';

    const results = await agent.run(task);

    console.log('\n📦 Full Results:');
    console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
    console.error('❌ Agent failed:', err.message);
    process.exit(1);
});
