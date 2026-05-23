require('dotenv').config();
const AutonomousAgent = require('./src/workflow/agent');

async function main() {
  const agent = new AutonomousAgent({
    aceApiKey: process.env.ACE_API_KEY,
    agentWallet: 'GUjhtFcxBEpi1TEzzXvXNgkvgggrfgGvobLBxXcLBBWr',
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
