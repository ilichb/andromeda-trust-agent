const { AutonomousAgent } = require('./src/workflow/agent');
require('dotenv').config();
const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

const keypairData = JSON.parse(fs.readFileSync(process.env.KEYPAIR_PATH, 'utf-8'));
const wallet = Keypair.fromSecretKey(Uint8Array.from(keypairData));

const agent = new AutonomousAgent({
  aceApiKey: process.env.ACE_API_KEY,
  agentWallet: wallet.publicKey.toBase58(),
  evmPrivateKey: process.env.EVM_PRIVATE_KEY
});

const tasks = [
  "Analyze Solana DeFi yield opportunities",
  "Compare Jupiter vs Raydium fees",
  "Explain Solana's fee market mechanism",
  "Summarize latest Solana ecosystem news",
  "Generate a security checklist for Solana smart contracts",
  // Añade más (puedes poner 20-30)
];

let count = 0;
const MAX_RUNS = 1000; // ajusta según tiempo
const INTERVAL_MS = 30000; // 30 segundos

async function runLoop() {
  while (count < MAX_RUNS) {
    const task = tasks[count % tasks.length];
    console.log(`\n🔄 Run ${count + 1}/${MAX_RUNS} - Task: ${task}`);
    try {
      await agent.run(task);
      console.log(`✅ Run ${count + 1} completed`);
    } catch (err) {
      console.error(`❌ Run ${count + 1} failed:`, err.message);
    }
    count++;
    await new Promise(r => setTimeout(r, INTERVAL_MS));
  }
  console.log('🎉 Bulk execution finished');
}

runLoop();
