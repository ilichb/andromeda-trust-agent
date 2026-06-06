/**
 * Synapse Sentinel client – Placeholder until official API is documented.
 *
 * This module implements the risk assessment required for Category 1 (Escrow mode).
 * When OOBE Protocol provides the official endpoint/function, replace the mock
 * implementation with a real HTTP call.
 *
 * Current behavior: always returns low risk (approved).
 * Logs clearly indicate it's a placeholder.
 *
 * @category Services
 */

const axios = require('axios');

class SentinelClient {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.SENTINEL_API_KEY || 'mock-key';
        this.endpoint = config.endpoint || process.env.SENTINEL_ENDPOINT || 'https://api.synapsesentinel.io/v1/assess';
        this.mockMode = !process.env.SENTINEL_API_KEY || process.env.SENTINEL_API_KEY === 'mock-key';

        if (this.mockMode) {
            console.log('[Sentinel] ⚠️  MOCK MODE — no SENTINEL_API_KEY set. Always returning low risk.');
            console.log('[Sentinel] ℹ️  Set SENTINEL_API_KEY and SENTINEL_ENDPOINT for real assessment.');
        } else {
            console.log(`[Sentinel] Initialized — endpoint: ${this.endpoint}`);
        }
    }

    /**
     * Assess risk of a given task.
     * @param {string} taskDescription - The task to assess
     * @returns {Promise<{riskScore: number, approved: boolean, reason: string}>}
     */
    async assessRisk(taskDescription) {
        const preview = taskDescription.substring(0, 80);
        console.log(`[Sentinel] Assessing risk for: "${preview}..."`);

        if (this.mockMode) {
            // Placeholder: always return low risk, approved
            const result = {
                riskScore: 0.1,
                approved: true,
                reason: 'Mock approval — official Sentinel API not yet available',
            };
            console.log(`[Sentinel] ✅ Risk score: ${result.riskScore} (threshold: 0.7) — Approved`);
            return result;
        }

        // Real implementation (when API is available)
        try {
            const { data } = await axios.post(
                this.endpoint,
                { task: taskDescription },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10_000,
                }
            );

            const riskScore = data.riskScore ?? data.risk_score ?? 0;
            const approved = riskScore < 0.7;
            const reason = data.reason || data.message || 'Assessed by Sentinel';

            console.log(`[Sentinel] Risk score: ${riskScore} — ${approved ? '✅ Approved' : '❌ Rejected'}`);
            return { riskScore, approved, reason };
        } catch (err) {
            console.warn(`[Sentinel] ⚠️  API call failed: ${err.message}. Falling back to low risk.`);
            return {
                riskScore: 0.1,
                approved: true,
                reason: `Fallback (API error: ${err.message})`,
            };
        }
    }
}

module.exports = SentinelClient;
