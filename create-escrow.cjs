const { SapClient, Pdas } = require("@oobe-protocol-labs/synapse-sap-sdk");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { AnchorProvider, Wallet, BN } = require("@coral-xyz/anchor");
const fs = require("fs");

const keypairData = JSON.parse(fs.readFileSync("/home/ilich/Escritorio/andromeda-core1/src/lib/blockchain/keys/solana-bot.json"));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const provider = new AnchorProvider(connection, new Wallet(keypair), {});
const sap = new SapClient(provider);

const agentWallet = new PublicKey("GUjhtFcxBEpi1TEzzXvXNgkvgggrfgGvobLBxXcLBBWr");
const [agentPda] = Pdas.getAgentPDA(agentWallet);
const [agentStake] = Pdas.getAgentStakePDA(agentWallet);
const [agentStats] = Pdas.getAgentStatsPDA(agentWallet); // <- wallet no agentPda
const [escrowPda] = Pdas.getEscrowV2PDA(agentPda, 0);
const [globalPda] = Pdas.getGlobalPDA();

console.log("AgentStats:", agentStats.toBase58());
console.log("EscrowPda:", escrowPda.toBase58());

async function main() {
  const ix = await sap.escrow.createEscrowV2({
    signer: keypair,
    depositor: keypair.publicKey,
    agent: agentPda,
    agentStake,
    agentStats,
    pricingMenu: globalPda,
    escrow: escrowPda,
    escrowNonce: new BN(0),
    pricePerCall: new BN(10000),
    maxCalls: new BN(10),
    initialDeposit: new BN(100000000),
    expiresAt: new BN(Math.floor(Date.now() / 1000) + 48 * 3600),
    volumeCurve: [],
    tokenMint: null,
    tokenDecimals: 9,
    settlementSecurity: 0,
    disputeWindowSlots: new BN(300),
    coSigner: null,
    arbiter: null,
  });

  const tx = await sap.buildTransaction([ix], keypair.publicKey);
  tx.sign([keypair]);
  const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  await connection.confirmTransaction(sig, "confirmed");
  console.log("✅ Escrow created! TX:", sig);
  console.log("🔗 https://explorer.solana.com/tx/" + sig);
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  console.error("Logs:", err.logs);
});
