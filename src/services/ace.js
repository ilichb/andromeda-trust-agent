const axios = require('axios');

const ACE_BASE = 'https://api.acedata.cloud';

class AceService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async chat(prompt, model = 'gpt-4o-mini') {
    console.log(`[Ace] Chat → ${model}`);
    const res = await axios.post(`${ACE_BASE}/v1/chat/completions`, {
      model,
      messages: [{ role: 'user', content: prompt }],
    }, { headers: this.headers });
    return res.data.choices[0].message.content;
  }

  async analyzeWithClaude(prompt) {
    console.log(`[Ace] Claude analysis`);
    return this.chat(prompt, 'claude-3-5-haiku-20241022');
  }

  async generateVideo(prompt) {
    console.log(`[Ace] Kling video → "${prompt.substring(0, 40)}..."`);
    const res = await axios.post(`${ACE_BASE}/kling/videos`, {
      action: 'text2video',
      model: 'kling-v1',
      prompt,
    }, { headers: this.headers });
    return res.data;
  }
}

module.exports = AceService;
