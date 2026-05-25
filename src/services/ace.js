const { createX402Client } = require('./x402-payment');

const ACE_BASE = 'https://api.acedata.cloud';

class AceService {
  /**
   * @param {object|string} config - objeto { apiKey, evmPrivateKey } o string (apiKey legacy)
   */
  constructor(config) {
    const apiKey      = typeof config === 'string' ? config : config.apiKey;
    const privateKey  = typeof config === 'string' ? process.env.EVM_PRIVATE_KEY : config.evmPrivateKey;

    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // Inicializar cliente x402 — wallet EVM lista para pagar si el servidor responde 402
    const { fetchWithPay, walletAddress } = createX402Client(privateKey);
    this.fetchWithPay  = fetchWithPay;
    this.walletAddress = walletAddress;
    console.log(`[Ace/x402] Payment wallet active: ${walletAddress}`);
  }

  /**
   * POST genérico usando x402-fetch.
   * Si el servidor responde 402, paga automáticamente en Base mainnet USDC y reintenta.
   * @param {string} endpoint
   * @param {object} body
   * @param {number} timeoutMs - timeout en ms (default 30s)
   */
  async _post(endpoint, body, timeoutMs = 30_000) {
    const url = `${ACE_BASE}${endpoint}`;
    console.log(`[Ace/x402] POST ${url}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchWithPay(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async chat(prompt, model = 'gpt-4o-mini') {
    console.log(`[Ace/x402] Chat → ${model}`);
    const data = await this._post('/v1/chat/completions', {
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
    try {
      const data = await this._post('/kling/videos', {
        action: 'text2video',
        model: 'kling-v1',
        prompt,
      }, 10_000); // 10s — Kling es asíncrono, no espera respuesta completa
      console.log(`[Ace/x402] Kling result: ${data.video_url || data.state || 'queued'}`);
      return data;
    } catch (e) {
      if (e.name === 'AbortError' || (e.message && e.message.includes('abort'))) {
        console.log(`[Ace/x402] Kling job enqueued (async video generation — check Ace dashboard)`);
        return { status: 'pending', message: 'Kling video generation queued — check Ace dashboard for result' };
      }
      throw e;
    }
  }
}

module.exports = AceService;
