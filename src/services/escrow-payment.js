/**
 * Escrow Payment Service — On-chain escrow payments via SAP SDK.
 *
 * Handles creation of V2 escrows and settlement of calls for Category 1.
 * Uses the same patterns as create-escrow.cjs (EscrowModule raw instructions).
 *
 * @category Services
 */

const { SapClient, Pdas } = require('@oobe-protocol-labs/synapse-sap-sdk');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { AnchorProvider, Wallet, BN } = require('@coral-xyz/anchor');
const fs = require('fs');
const crypto = require('crypto');

class EscrowPaymentService {
    /**
     * @param {Object} config
     * @param {string} config.keypairPath - Path to Solana keypair JSON file
     * @param {string} config.rpcUrl - Solana RPC URL
     * @param {string} config.agentWallet - Agent wallet public key (base58)
     * @param {boolean} [config.dryRun] - If true, simulate without real transactions
     */
    constructor(config) {
        this.keypairPath = config.keypairPath;
        this.rpcUrl = config.rpcUrl || 'https://api.mainnet-beta.solana.com';
        this.agentWallet = new PublicKey(config.agentWallet);
        this.dryRun = config.dryRun === true || process.env.DRY_RUN === 'true';

        // Escrow parameters
        this.escrowNonce = 0;
        this.callsMade = 0;
        this.maxCalls = 10;
        this.pricePerCallLamports = 10000; // ~0.00001 SOL per call
        this.initialDepositLamports = this.pricePerCallLamports * this.maxCalls;

        // Initialize SDK
        this._init();
    }

    _init() {
        const keypairData = JSON.parse(fs.readFileSync(this.keypairPath, 'utf-8'));
        const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
        const connection = new Connection(this.rpcUrl, 'confirmed');
        const provider = new AnchorProvider(connection, new Wallet(keypair), {
            commitment: 'confirmed',
        });
        this.sap = new SapClient(provider);
        this.wallet = keypair;
        this.provider = provider;

        console.log(`[Escrow] Initialized — wallet: ${keypair.publicKey.toBase58()}`);
        console.log(`[Escrow] Agent wallet: ${this.agentWallet.toBase58()}`);
        console.log(`[Escrow] RPC: ${this.rpcUrl}`);
        if (this.dryRun) {
            console.log('[Escrow] 🔷 DRY RUN mode — no real transactions will be sent');
        }
    }

    /**
     * Ensure an escrow exists for this agent. Creates one if not found.
     * @returns {Promise<PublicKey>} The escrow PDA
     */
    async ensureEscrow() {
        const [agentPda] = Pdas.getAgentPDA(this.agentWallet);
        const [escrowPda] = Pdas.getEscrowV2PDA(agentPda, this.escrowNonce);

        console.log(`[Escrow] Agent PDA: ${agentPda.toBase58()}`);
        console.log(`[Escrow] Escrow PDA: ${escrowPda.toBase58()}`);

        if (this.dryRun) {
            console.log('[Escrow] 🔷 DRY RUN: Would create escrow with parameters:');
            console.log(`  - pricePerCall: ${this.pricePerCallLamports} lamports`);
            console.log(`  - maxCalls: ${this.maxCalls}`);
            console.log(`  - initialDeposit: ${this.initialDepositLamports} lamports`);
            console.log(`  - settlementSecurity: 2 (DisputeWindow)`);
            console.log(`  - disputeWindowSlots: 2160 (~15 min)`);
            return escrowPda;
        }

        // Check if escrow already exists
        try {
            const account = await this.provider.connection.getAccountInfo(escrowPda);
            if (account && account.data.length > 32) {
                console.log('[Escrow] ✅ Escrow already exists on-chain — reusing');
                return escrowPda;
            }
        } catch (_err) {
            // Account doesn't exist, will create below
        }

        console.log('[Escrow] Creating new escrow on-chain...');

        const [agentPda2] = Pdas.getAgentPDA(this.agentWallet);
        const [agentStake] = Pdas.getAgentStakePDA(this.agentWallet);
        const [agentStats] = Pdas.getAgentStatsPDA(this.agentWallet);
        const [globalPda] = Pdas.getGlobalPDA();

        const ix = await this.sap.escrow.createEscrowV2({
            signer: this.wallet,
            depositor: this.wallet.publicKey,
            agent: agentPda2,
            agentStake,
            agentStats,
            pricingMenu: globalPda,
            escrow: escrowPda,
            escrowNonce: new BN(this.escrowNonce),
            pricePerCall: new BN(this.pricePerCallLamports),
            maxCalls: new BN(this.maxCalls),
            initialDeposit: new BN(this.initialDepositLamports),
            expiresAt: new BN(Math.floor(Date.now() / 1000) + 48 * 3600),
            volumeCurve: [],
            tokenMint: null,
            tokenDecimals: 9,
            settlementSecurity: 2, // DisputeWindow
            disputeWindowSlots: new BN(2160), // ~15 min
            coSigner: null,
            arbiter: null,
        });

        const tx = await this.sap.buildTransaction([ix], this.wallet.publicKey);
        tx.sign([this.wallet]);
        const sig = await this.provider.connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: false,
        });
        await this.provider.connection.confirmTransaction(sig, 'confirmed');
        console.log(`[Escrow] ✅ Escrow created! TX: ${sig}`);
        console.log(`[Escrow] 🔗 https://explorer.solana.com/tx/${sig}`);

        return escrowPda;
    }

    /**
     * Settle a call against the escrow.
     * In production, this would call settleCallsV2 on-chain.
     * For demo purposes, it logs the settlement and increments counter.
     *
     * @param {string} serviceName - Name of the service being paid for (e.g. 'analysis')
     * @returns {Promise<boolean>}
     */
    async settleCall(serviceName = 'unknown') {
        this.callsMade++;
        console.log(`[Escrow] 💰 Settling call #${this.callsMade}/${this.maxCalls} (${serviceName})`);

        if (this.dryRun) {
            console.log(`[Escrow] 🔷 DRY RUN: Would settle ${serviceName} for ${this.pricePerCallLamports} lamports`);
            return true;
        }

        // In production, this would call sap.escrow.settleCallsV2 with a service hash.
        // For the demo, we simulate the settlement since the escrow creation already
        // demonstrates on-chain capability.
        const serviceHash = crypto.createHash('sha256').update(serviceName).digest();
        console.log(`[Escrow] Service hash: ${serviceHash.toString('hex').substring(0, 16)}...`);

        // TODO: Real settlement when escrow has funds
        // const [agentPda] = Pdas.getAgentPDA(this.agentWallet);
        // const [escrowPda] = Pdas.getEscrowV2PDA(agentPda, this.escrowNonce);
        // const ix = await this.sap.escrow.settleCallsV2({
        //     signer: this.wallet,
        //     wallet: this.wallet.publicKey,
        //     agent: agentPda,
        //     agentStats: Pdas.getAgentStatsPDA(this.agentWallet)[0],
        //     escrow: escrowPda,
        //     settlementReceipt: ..., // derive from escrowPda + serviceHash
        //     escrowNonce: new BN(this.escrowNonce),
        //     callsToSettle: new BN(1),
        //     serviceHash: [...serviceHash],
        // });

        console.log(`[Escrow] ✅ Call #${this.callsMade} settled (simulated)`);
        return true;
    }
}

module.exports = EscrowPaymentService;
