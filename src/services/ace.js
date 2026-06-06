const { createX402Client } = require('./x402-payment');
const axios = require('axios');
const ACE_BASE = 'https://api.acedata.cloud';

class AceService {
  constructor(config) {
    const apiKey = typeof config === 'string' ? config : config.apiKey;
    const privateKey = typeof config === 'string' ? process.env.EVM_PRIVATE_KEY : config.evmPrivateKey;
    const paymentMode = config.paymentMode || 'x402';

    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    if (paymentMode === 'escrow') {
      // Modo escrow: usa fetch nativo (sin x402).
      // El pago ya está garantizado por el escrow on-chain de SAP.
      // Solo necesitamos la API key de Ace para autenticación.
      this.fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
      console.log('[Ace] Modo ESCROW — pagos on-chain via SAP escrow (sin x402)');
    } else {
      // Modo x402 (Categoría 2) — comportamiento original intacto
      const { fetchWithPay, walletAddress } = createX402Client(privateKey);
      this.fetchFn = fetchWithPay;
      this.walletAddress = walletAddress;
      console.log(`[Ace/x402] Payment wallet active: ${walletAddress}`);
    }
  }

  async chat(prompt, model = 'gpt-4o-mini') {
    console.log(`[Ace] Chat → ${model}`);
    const response = await this.fetchFn(`${ACE_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Always reply in English only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async analyzeWithClaude(prompt) {
    return this.chat(prompt, 'claude-3-5-haiku-20241022');
  }

  async generateVideo(prompt) {
    console.log('[Ace] Kling video generating...');
    const { data } = await axios.post(
      `${ACE_BASE}/kling/videos`,
      {
        action: 'text2video',
        model: 'kling-v1',
        prompt,
      },
      {
        headers: this.headers,
        timeout: 420_000, // 7 minutos
      }
    );
    console.log(`[Ace] Kling result: ${data.video_url}`);
    return data;
  }
}

module.exports = AceService;
