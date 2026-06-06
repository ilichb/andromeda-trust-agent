# Andromeda Trust Agent

Agente autónomo para el bounty de **OOBE Protocol + Ace Data Cloud**. Participa en **ambas categorías**:

| Categoría | Método de pago | Entry point | Script |
|-----------|---------------|-------------|--------|
| **Cat 1** — General Payment Volume | Escrow on-chain (SAP SDK) + Sentinel | `index-escrow.js` | `npm run cat1` |
| **Cat 2** — Ace Data Cloud Usage | x402 facilitator | `index.js` | `npm start` |

---

## Requisitos

- Node.js 18+
- Una API key de [Ace Data Cloud](https://acedata.cloud)
- Una wallet EVM con fondos (para x402 — Cat 2)
- Un keypair de Solana (para escrow — Cat 1)
- (Opcional) Synapse Sentinel API key

## Instalación

```bash
cd agent
npm install
cp .env.example .env
# Editar .env con tus claves
```

## Variables de Entorno

Ver `.env.example` para la lista completa. Las más importantes:

| Variable | Descripción |
|----------|-------------|
| `ACE_API_KEY` | API key de Ace Data Cloud |
| `EVM_PRIVATE_KEY` | Private key EVM para pagos x402 (Cat 2) |
| `KEYPAIR_PATH` | Ruta al JSON del keypair de Solana (Cat 1) |
| `SENTINEL_API_KEY` | API key de Synapse Sentinel (Cat 1, opcional) |
| `DRY_RUN` | `true` para simular escrow sin TX reales (Cat 1) |

---

## Categoría 2 — x402 (original)

```bash
npm start "describe your task"
```

Usa el facilitator x402 para pagar cada llamada a la API de Ace Data Cloud. No requiere Sentinel ni escrow.

## Categoría 1 — Escrow + Sentinel (nuevo)

```bash
npm run cat1 "describe your task"
```

### Flujo:

1. **Synapse Sentinel** evalúa el riesgo de la tarea. Si el score > 0.7, aborta.
2. **Escrow on-chain** se crea (o reutiliza) vía SAP SDK en Solana mainnet.
3. **GPT-4o-mini** analiza la tarea.
4. **Claude 3.5 Haiku** valida el plan.
5. **Kling** genera un video resumen.
6. Cada paso registra un settlement contra el escrow.

### Dry run:

```bash
DRY_RUN=true npm run cat1 "test task"
```

Simula la creación de escrow y settlements sin enviar transacciones reales.

### Wallet registrada en SAP mainnet:

```
GUjhtFcxBEpi1TEzzXvXNgkvgggrfgGvobLBxXcLBBWr
```

---

## Estructura del proyecto

```
agent/
├── index.js              # Entry point Cat 2 (x402)
├── index-escrow.js       # Entry point Cat 1 (escrow + sentinel)
├── package.json
├── .env.example
├── README.md
├── create-escrow.cjs     # Script standalone para crear escrow
└── src/
    ├── services/
    │   ├── ace.js              # Cliente Ace Data Cloud
    │   ├── x402-payment.js     # Cliente x402 facilitator
    │   ├── sentinel.js         # Cliente Synapse Sentinel (mock)
    │   └── escrow-payment.js   # Cliente escrow on-chain (SAP SDK)
    └── workflow/
        └── agent.js            # Orquestador del agente
```

---

## Notas

- **Sentinel**: El cliente actual es un **mock** que siempre retorna riesgo bajo. Cuando OOBE proporcione el endpoint real, solo hay que setear `SENTINEL_API_KEY` y `SENTINEL_ENDPOINT`.
- **Escrow**: La creación de escrow on-chain está implementada y funcional (ver `create-escrow.cjs`). El settlement de calls está simulado hasta que se funde el escrow con USDC/SOL.
- **Synapse RPC**: Las transacciones de escrow se envían a través de la RPC configurada (default: mainnet-beta). Para usar Synapse RPC, setear `RPC_URL` con el endpoint de Synapse.
