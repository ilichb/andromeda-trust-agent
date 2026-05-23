# Andromeda Trust Agent 🤖

Autonomous SAP agent built for the OOBE Protocol + Ace Data Cloud Bounty (Superteam).

## Category
**Category 2: Ace Data Cloud Usage (x402 Facilitator)**

## What it does
An autonomous agent that:
1. Discovers and registers on Synapse Agent Protocol (SAP) mainnet
2. Executes a complete workflow using 3 distinct Ace Data Cloud services
3. Runs end-to-end without manual intervention

## Workflow
## Services Used (3 distinct Ace Data Cloud APIs)
- **GPT-4o-mini** — Task analysis and action planning
- **Claude-3-5-haiku** — Plan validation and risk assessment  
- **Kling-v1** — Visual report generation (text-to-video)

## Agent Info
- **Wallet:** `GUjhtFcxBEpi1TEzzXvXNgkvgggrfgGvobLBxXcLBBWr`
- **AgentPda:** `CUMRudURg3fPw8F9fXL4SgrvbFpag82SdRyi9Ehrn3sh`
- **Network:** Solana Mainnet-Beta
- **Protocol:** SAP v2

## Run
```bash
git clone https://github.com/ilichb/andromeda-trust-agent
cd andromeda-trust-agent
npm install
cp .env.example .env  # Add your ACE_API_KEY
node index.js "Your task here"
```

## Demo
Agent registered on SAP mainnet:
https://explorer.solana.com/address/CUMRudURg3fPw8F9fXL4SgrvbFpag82SdRyi9Ehrn3sh
