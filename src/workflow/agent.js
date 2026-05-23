const AceService = require('../services/ace');

class AutonomousAgent {
  constructor(config) {
    this.ace = new AceService({
      apiKey: config.aceApiKey,
      evmPrivateKey: config.evmPrivateKey,
    });
    this.agentWallet = config.agentWallet;   // Solana SAP
    this.evmWallet = config.evmWallet;       // Base USDC
    this.results = [];
  }

  async run(task) {
    console.log('\n🤖 === ANDROMEDA TRUST AGENT STARTING ===');
    console.log(`📋 Task: ${task}`);
    console.log('─'.repeat(50));

    // Step 1: GPT analyzes the task
    console.log('\n[Step 1] GPT-4o-mini analyzing task...');
    const analysis = await this.ace.chat(
      `You are an autonomous agent. Analyze this task and give a concise action plan in 3 steps: "${task}"`
    );
    console.log(`✅ Analysis: ${analysis.substring(0, 100)}...`);
    this.results.push({ step: 'analysis', model: 'gpt-4o-mini', output: analysis });

    // Step 2: Claude validates and refines
    console.log('\n[Step 2] Claude validating plan...');
    const validation = await this.ace.analyzeWithClaude(
      `Review this action plan and identify any risks or improvements (reply in 50 words max): "${analysis}"`
    );
    console.log(`✅ Validation: ${validation.substring(0, 100)}...`);
    this.results.push({ step: 'validation', model: 'claude-3-5-haiku', output: validation });

    // Step 3: Kling generates visual report
    console.log('\n[Step 3] Kling generating visual report...');
    const videoPrompt = `Professional AI agent dashboard showing autonomous task execution, data streams, and blockchain transactions for: ${task}`;
    const video = await this.ace.generateVideo(videoPrompt);
    const videoResult = video.video_url || video.message || JSON.stringify(video);
    console.log(`✅ Kling: ${videoResult}`);
    this.results.push({ step: 'video', model: 'kling-v1', output: videoResult });

    // Final report
    console.log('\n📊 === WORKFLOW COMPLETE ===');
    console.log(`Services used: ${this.results.length}`);
    console.log(`Solana agent wallet: ${this.agentWallet}`);
    console.log(`EVM payment wallet:  ${this.evmWallet}`);
    this.results.forEach(r => console.log(`  ✓ ${r.step} → ${r.model}`));
    
    return this.results;
  }
}

module.exports = AutonomousAgent;
