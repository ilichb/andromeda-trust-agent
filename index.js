require('dotenv').config();
const AutonomousAgent = require('./src/workflow/agent');

// Validar variables críticas antes de arrancar
const required = ['ACE_API_KEY', 'EVM_PRIVATE_KEY', 'EVM_WALLET_ADDRESS'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Falta variable de entorno: ${key}`);
    process.exit(1);
  }
}

async function main() {
  const agent = new AutonomousAgent({
    aceApiKey: process.env.ACE_API_KEY,
    evmPrivateKey: process.env.EVM_PRIVATE_KEY,
    agentWallet: 'GUjhtFcxBEpi1TEzzXvXNgkvgggrfgGvobLBxXcLBBWr', // Solana SAP wallet
    evmWallet: process.env.EVM_WALLET_ADDRESS,
  });

  const task = process.argv[2] || 'Analyze Solana DeFi market trends and generate autonomous trading insights';

  const results = await agent.run(task);

  console.log('\n📦 Full Results:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error('❌ Agent failed:', err.message);
  process.exit(1);
});
