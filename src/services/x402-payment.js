const { createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { base } = require('viem/chains');
const { wrapFetchWithPayment } = require('x402-fetch');

/**
 * Crea un fetch envuelto con capacidad de pago x402 automático.
 * Si el servidor responde 402 Payment Required, paga con USDC en Base mainnet
 * y reintenta la petición automáticamente.
 *
 * @param {string} privateKey - Clave privada EVM (0x...)
 * @param {bigint} [maxValueUSDC=1_000_000n] - Máximo a pagar por petición (default: 1 USDC = 1_000_000 unidades)
 * @returns {{ fetchWithPay: Function, walletAddress: string }}
 */
function createX402Client(privateKey, maxValueUSDC = 1_000_000n) {
  if (!privateKey || !privateKey.startsWith('0x')) {
    throw new Error('EVM_PRIVATE_KEY inválida. Debe comenzar con 0x');
  }

  const account = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({
    account,
    transport: http(),
    chain: base, // Base mainnet — donde están tus 4.8 USDC
  });

  // Máximo de pago por llamada: 1 USDC por defecto (protección contra pagos no esperados)
  const fetchWithPay = wrapFetchWithPayment(fetch, walletClient, maxValueUSDC);

  console.log(`[x402] Wallet configurada: ${account.address}`);
  console.log(`[x402] Red: Base mainnet`);
  console.log(`[x402] Límite por pago: ${Number(maxValueUSDC) / 1_000_000} USDC`);

  return {
    fetchWithPay,
    walletAddress: account.address,
  };
}

module.exports = { createX402Client };
