const AceService = require('../services/ace');
const SentinelClient = require('../services/sentinel');
const EscrowPaymentService = require('../services/escrow-payment');

class AutonomousAgent {
  constructor(config) {
    this.paymentMode = config.paymentMode || 'x402';
    this.ace = new AceService({
      apiKey: config.aceApiKey,
      evmPrivateKey: config.evmPrivateKey,
      paymentMode: this.paymentMode,
    });
    this.agentWallet = config.agentWallet;
    this.evmWallet = config.evmWallet;
    this.results = [];

    if (this.paymentMode === 'escrow') {
      this.sentinel = new SentinelClient();
      this.escrow = new EscrowPaymentService({
        keypairPath: config.keypairPath,
        rpcUrl: config.rpcUrl,
        agentWallet: config.agentWallet,
        dryRun: config.dryRun,
      });
    }
  }

  async run(task) {
    console.log(`\n🤖 === ANDROMEDA TRUST AGENT (Mode: ${this.paymentMode.toUpperCase()}) ===`);
    console.log(`📋 Task: ${task}`);
    console.log('─'.repeat(50));

    // ── Step 0: Sentinel risk assessment (only for escrow mode) ──
    if (this.paymentMode === 'escrow') {
      console.log('\n[Step 0] Synapse Sentinel assessing task risk...');
      try {
        const risk = await this.sentinel.assessRisk(task);
        if (!risk.approved) {
          console.error(`❌ [Sentinel] Task REJECTED. Risk score: ${risk.riskScore}`);
          console.error(`   Reason: ${risk.reason}`);
          return this.results;
        }
        console.log(`✅ [Sentinel] Risk score: ${risk.riskScore} — Approved`);

        // Ensure escrow exists before proceeding
        console.log('\n[Step 0b] Ensuring escrow exists...');
        await this.escrow.ensureEscrow();
      } catch (err) {
        console.warn(`⚠️ [Sentinel] Non-blocking error: ${err.message}`);
        console.warn('   Continuing without Sentinel assessment...');
      }
    }

    // ── Step 1: GPT-4o-mini analyzes the task ──
    console.log('\n[Step 1] GPT-4o-mini analyzing task...');
    const analysis = await this.ace.chat(
      `You are an autonomous agent. Analyze this task and give a concise action plan in 3 steps: "${task}"`
    );
    console.log(`✅ Analysis: ${analysis.substring(0, 100)}...`);
    this.results.push({ step: 'analysis', model: 'gpt-4o-mini', output: analysis });

    if (this.paymentMode === 'escrow') {
      await this.escrow.settleCall('analysis');
    }

    // ── Step 2: Claude validates and refines ──
    console.log('\n[Step 2] Claude validating plan...');
    const validation = await this.ace.analyzeWithClaude(
      `Review this action plan and identify any risks or improvements (reply in 50 words max): "${analysis}"`
    );
    console.log(`✅ Validation: ${validation.substring(0, 100)}...`);
    this.results.push({ step: 'validation', model: 'claude-3-5-haiku', output: validation });

    if (this.paymentMode === 'escrow') {
      await this.escrow.settleCall('validation');
    }

    // ── Step 3: Kling generates visual report ──
    console.log('\n[Step 3] Kling generating visual report...');
    const videoPrompt = `Professional AI agent dashboard showing autonomous task execution, data streams, and blockchain transactions for: ${task}`;
    const video = await this.ace.generateVideo(videoPrompt);
    const videoResult = video.video_url || video.message || JSON.stringify(video);
    console.log(`✅ Kling: ${videoResult}`);
    this.results.push({ step: 'video', model: 'kling-v1', output: videoResult });

    if (this.paymentMode === 'escrow') {
      await this.escrow.settleCall('video');
    }

    // ── Final report ──
    console.log('\n📊 === WORKFLOW COMPLETE ===');
    console.log(`Services used: ${this.results.length}`);
    console.log(`Solana agent wallet: ${this.agentWallet}`);
    if (this.evmWallet) {
      console.log(`EVM payment wallet:  ${this.evmWallet}`);
    }
    this.results.forEach((r) => console.log(`  ✓ ${r.step} → ${r.model}`));

    return this.results;
  }
}

module.exports = AutonomousAgent;
