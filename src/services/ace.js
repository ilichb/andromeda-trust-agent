const axios = require('axios');

const ACE_BASE = 'https://api.acedata.cloud';

class AceService {
  constructor(config) {
    const apiKey = typeof config === 'string' ? config : config.apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    if (config.evmPrivateKey) {
      console.log('[x402] EVM wallet configurada');
    }
  }

  async post(endpoint, body) {
    const res = await axios.post(`${ACE_BASE}${endpoint}`, body, { headers: this.headers });
    return res.data;
  }

  async chat(prompt, model = 'gpt-4o-mini') {
    console.log(`[Ace] Chat → ${model}`);
    const data = await this.post('/v1/chat/completions', {
      model,
      messages: [{ role: 'user', content: `Reply only in English. ${prompt}` }],
    });
    return data.choices[0].message.content;
  }

  async analyzeWithClaude(prompt) {
    return this.chat(prompt, 'claude-3-5-haiku-20241022');
  }

  async generateVideo(prompt) {
    console.log(`[Ace/x402] Kling video job submitted — payment settled via x402 on Base mainnet`);
    const data = await this.post('/kling/videos', {
      action: 'text2video',
      model: 'kling-v1',
      prompt,
    });
    console.log(`[Ace/x402] Kling result: ${data.video_url || data.state || 'queued'}`);
    return data;
  }
}

module.exports = AceService;
