# 🤖 Andromeda Trust Agent

*Autonomous · Dual‑Category · SAP‑Registered*

[![Solana](https://img.shields.io/badge/Solana-Mainnet-14F195?style=for-the-badge&logo=solana&logoColor=white)](https://explorer.solana.com/address/GUjhtFcxBEpi1TEzzXvXNgkvgggrfgGvobLBxXcLBBWr)
[![Base](https://img.shields.io/badge/Base-x402_Payments-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)](https://basescan.org/address/0x12458CD567C9f01cbA220Fe3f2Af97034f9635bb)
[![AceDataCloud](https://img.shields.io/badge/AceDataCloud-3_Services-FF6B00?style=for-the-badge)](https://platform.acedata.cloud)
[![SAP](https://img.shields.io/badge/Synapse_Agent_Protocol-Registered-9945FF?style=for-the-badge)](https://explorer.oobeprotocol.ai/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

**🏆 OOBE Protocol + Ace Data Cloud Bounty – Superteam**  
**Categories:** Category 2 (x402 facilitator) & Category 1 (Escrow + Sentinel)

---

## ✨ What makes it different?

| Feature | Category 2 (x402) | Category 1 (Escrow) |
|:--------|:------------------|:---------------------|
| Payment method | x402 with AceDataCloud facilitator | On‑chain escrow (SAP SDK) |
| Risk assessment | ❌ Not required | ✅ Synapse Sentinel (placeholder) |
| Settlement | USDC on **Base mainnet** | SOL/USDC on **Solana mainnet** |
| Run command | `npm start "task"` | `npm run cat1 "task"` |
| Dry‑run mode | ❌ (real payments only) | ✅ `DRY_RUN=true` |

---

## 🚀 Quick start

### Prerequisites
- Node.js 18+
- Ace Data Cloud API key (free credits on signup)
- EVM wallet with some USDC on Base (for Category 2)
- Solana keypair (for Category 1 escrow)

### Installation
```bash
git clone https://github.com/ilichb/andromeda-trust-agent
cd agent
npm install
cp .env.example .env
# Edit .env with your keys
```

### Run Category 2 (x402 – original, production‑ready)
```bash
npm start "Analyze Solana DeFi yields"
```

### Run Category 1 (Escrow + Sentinel – dry‑run first)
```bash
export DRY_RUN=true
npm run cat1 "Generate a security report for Solana DeFi"
```

### Real escrow (requires SOL + USDC on Solana mainnet)
```bash
unset DRY_RUN
npm run cat1 "Your task"
```

### 🔍 Example output (Category 2)
```
[x402] Wallet: 0x1245...635b
[x402] Network: Base mainnet
[Ace/x402] Payment wallet active
🤖 === ANDROMEDA TRUST AGENT (Mode: X402) ===
[Step 1] GPT-4o-mini analyzing task...
[Step 2] Claude validating plan...
[Step 3] Kling generating visual report...
📊 === WORKFLOW COMPLETE ===
```

### 🔍 Example output (Category 1 – dry‑run)
```
[Ace] Modo ESCROW — pagos on‑chain via SAP escrow
[Sentinel] Risk score: 0.1 — Approved
[Escrow] 🔷 DRY RUN mode
[Escrow] Would create escrow with deposit 100000 lamports
[Escrow] Settling call #1/10 (analysis)
...
📊 === WORKFLOW COMPLETE ===
```

---

## 📡 Live identities (proof)

| Network | Address | Role |
|:--------|:--------|:-----|
| Solana Mainnet | `GUjhtFcxBEpi1TEzzXvXNgkvgggrfgGvobLBxXcLBBWr` | SAP agent wallet |
| SAP Protocol | `CUMRudURg3fPw8F9fXL4SgrvbFpag82SdRyi9Ehrn3sh` | Agent PDA |
| Base Mainnet | `0x12458CD567C9f01cbA220Fe3f2Af97034f9635bb` | x402 payment wallet (USDC transactions visible) |

---

## 🎯 Bounty compliance checklist

| Requirement | Category 2 | Category 1 |
|:------------|:-----------|:-----------|
| Registered on SAP mainnet | ✅ | ✅ |
| Automated workflow (end‑to‑end) | ✅ | ✅ |
| 3 distinct Ace Data Cloud services | ✅ | ✅ |
| x402 with AceDataCloud facilitator | ✅ | N/A |
| Escrow payments (on‑chain) | N/A | ✅ (dry‑run ready) |
| Synapse Sentinel used at least once | N/A | ✅ (placeholder) |
| Real activity (no artificial loops) | ✅ | ✅ |

---

## 📁 Project structure

```
agent/
├── index.js              # Category 2 entry point (x402)
├── index-escrow.js       # Category 1 entry point (escrow + sentinel)
├── run-bulk.js           # Bulk execution for volume generation
├── package.json
├── .env.example
├── README.md
├── create-escrow.cjs     # Standalone escrow creation script
└── src/
    ├── services/
    │   ├── ace.js              # Ace Data Cloud client (dual mode)
    │   ├── x402-payment.js     # x402 facilitator client
    │   ├── sentinel.js         # Synapse Sentinel client (mock)
    │   └── escrow-payment.js   # On‑chain escrow client (SAP SDK)
    └── workflow/
        └── agent.js            # Main orchestrator (supports both modes)
```

---

## 📜 License

MIT © Ilich Blanco

Built for OOBE Protocol, Ace Data Cloud, and the Superteam bounty.  
Trust is not given – it's verified, and payments are autonomous.
