require('dotenv').config();
const axios = require('axios');
const readline = require('readline');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { GasPrice, coins } = require('@cosmjs/stargate');
const { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } = require('@cosmjs/proto-signing');

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  underline: "\x1b[4m",
  bright: "\x1b[1m\x1b[37m"
};

const logger = {
  info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}[➤] ${msg}${colors.reset}`),
  banner: () => {
    console.log(`${colors.red}${colors.bold}`);
    console.log("#########################################################");
    console.log(" ______                        ______                                    ");
    console.log("/      \\                      /      \\                                   ");
    console.log("|  $$$$$$\\  ______    ______  |  $$$$$$\\ __   __   __   ______    ______  ");
    console.log("| $$  | $$ /      \\  /      \\ | $$___\\$$|  \\ |  \\ |  \\ |      \\  /      \\ ");
    console.log("| $$  | $$|  $$$$$$\\|  $$$$$$\\ \\$$    \\ | $$ | $$ | $$  \\$$$$$$\\|  $$$$$$\\");
    console.log("| $$  | $$| $$   \\$$| $$  | $$ _\\$$$$$$\\| $$ | $$ | $$ /      $$| $$  | $$");
    console.log("| $$__/ $$| $$      | $$__/ $$|  \\__| $$| $$_/ $$_/ $$|  $$$$$$$| $$__/ $$");
    console.log(" \\$$    $$| $$       \\$$    $$ \\$$    $$ \\$$   $$   $$ \\$$    $$| $$    $$");
    console.log("  \\$$$$$$  \\$$        \\$$$$$$   \\$$$$$$   \\$$$$$\\$$$$   \\$$$$$$$| $$$$$$$ ");
    console.log("                                                                | $$      ");
    console.log("                                                                | $$      ");
    console.log("                                                                 \\$$      ");
    console.log("               Oroswap By @kenjisubagja               ");
    console.log("#########################################################");
    console.log(`${colors.reset}`);
  },
};


const RPC_URL = 'https://rpc.zigscan.net/';
const EXPLORER_URL = 'https://zigscan.org/tx/';
const GAS_PRICE = GasPrice.fromString('0.025uzig');

const DENOM_ZIG = 'uzig';

// Daftar token yang bisa di-swap
const TOKENS = [
  { name: 'STABLE', denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.stablecoin', pairContract: 'zig1uujj7f4ga5g4p8jmde4dhkp696l3lc9tze8n6xvljghtd5dqemrs7qxz3u' },
  { name: 'FART', denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.fartcoin', pairContract: 'zig16hgeu44j5vezxavgjkgqsl2wy77223kqyu8al0vq73te0uh7374q33mqjg' },
  { name: 'STZIG', denom: 'zig1f6dk5csplyvyqvk7uvtsf8yll82lxzmquzctw7wvwajn2a7emmeqzzgvly', pairContract: 'zig19zqxslng99gw98ku3dyqaqy0c809kwssw7nzhea9x40jwxjugqvs5xaghj' },
  { name: 'WIZZ', denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.wizz', pairContract: 'zig1ej9x8me3fhtm9hwvu6tngklxp5hqekg3d893vf6ewevlvz55a99qs7mcl0' },
  { name: 'ORO', denom: 'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro', pairContract: 'zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg' },
  { name: 'STASH', denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.stasher', pairContract: 'zig17wzgjl65rdtz6upuppquda48mea9k6ct2kl3thwn5w6cuw8kz3nsy409xd' },
  { name: 'Liquidity', denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.luy', pairContract: 'zig1z3thnc2nmzurxdp6hd3jhmranqh0smgjr32txjqmzg64ezvfm7yqvfcd2x' },
  { name: 'Tokpay', denom: 'coin.zig10xvc3tkqrdyym6ep9lrt5005mrwvw6rml66qv7jxwnzlpqfmw7ksq7n7nm.tokx', pairContract: 'zig12uuukcny02kdg893jmq8ltyksfksdjd73savp8pn28lzpe9ka6gshn9sfg' },
  { name: 'AIR', denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.airbyshaheer', pairContract: 'zig1g88vwu5nfl05gr0ws2fqsg4wg9p4qpmfysqrzdsw4wzznnen2ffsruuufa' },
  { name: 'RWA', denom: 'coin.zig12jzwc0a3pyv4dze0t252qkwf77t4vs5rqfn3zc.rwa123', pairContract: 'zig1w4dhv6pnrp24lgsphc0kqyyazmxjfvfn4yzap908ukkjwlgdl7nqwszh5g' },
  { name: 'SIM', denom: 'coin.zig10xvc3tkqrdyym6ep9lrt5005mrwvw6rml66qv7jxwnzlpqfmw7ksq7n7nm.simpson', pairContract: 'zig1wtx96tnws5rvcn84l9jfavxd3dwl8r35rcfkt07tcdxaap34aeas3h4ynq' },
  { name: 'PUMP', denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.pumpfun', pairContract: 'zig1k0728vraxvf7gn3dptlnlwk5etrwlfd2yagf5u9jnsj9x7wpskds9xhjya' },
  { name: 'TEST', denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.tester', pairContract: 'zig1p6trvzv7s3asxhev8yaqfrk59u4y4nrg3xncmxwryx5lzcqxu06sxdmnrs' },
];

const TOKEN_DECIMALS = TOKENS.reduce((acc, t) => {
  acc[t.denom] = 6;
  return acc;
}, { uzig: 6 });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => rl.question(question, (ans) => resolve(ans.trim())));
}

function toMicroUnits(amount, denom) {
  const decimals = TOKEN_DECIMALS[denom] || 6;
  return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
}

function isMnemonic(input) {
  const words = input.trim().split(/\s+/);
  return words.length >= 12 && words.length <= 24 && words.every(word => /^[a-z]+$/.test(word));
}

async function getWallet(key) {
  if (isMnemonic(key)) return await DirectSecp256k1HdWallet.fromMnemonic(key, { prefix: 'zig' });
  else if (/^[0-9a-fA-F]{64}$/.test(key)) return await DirectSecp256k1Wallet.fromKey(Buffer.from(key, 'hex'), 'zig');
  else throw new Error('Invalid key');
}

async function getAccountAddress(wallet) {
  const [acc] = await wallet.getAccounts();
  return acc.address;
}

async function getBalance(client, address, denom) {
  const balance = await client.getBalance(address, denom);
  return parseFloat(balance.amount) / Math.pow(10, TOKEN_DECIMALS[denom]);
}

function getRandomSwapAmount(maxBalance) {
  const min = 0.0001, max = Math.min(0.0005, maxBalance * 0.3);
  return Math.random() * (max - min) + min;
}

async function performSwap(wallet, address, amount, token, swapNumber, maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, { gasPrice: GAS_PRICE });
      const microAmount = toMicroUnits(amount, token.denom);
      const msg = {
        swap: {
          offer_asset: { amount: microAmount.toString(), info: { native_token: { denom: DENOM_ZIG } } },
          ask_asset_info: { native_token: { denom: token.denom } }
        }
      };
      const funds = coins(microAmount, DENOM_ZIG);
      logger.loading(`Swap ${swapNumber}: ${amount.toFixed(5)} ZIG -> ${token.name} (Attempt ${retries+1}/${maxRetries})`);
      const result = await client.execute(address, token.pairContract, msg, 'auto', 'Swap', funds);
      logger.success(`Swap ${swapNumber} completed! Tx: ${EXPLORER_URL}${result.transactionHash}`);
      return result;
    } catch (error) {
      retries++;
      logger.error(`Swap ${swapNumber} failed: ${error.message} (Attempt ${retries}/${maxRetries})`);
      if (retries === maxRetries) return null;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return null;
}

async function executeTransactionCycle(wallet, address, cycleNumber, walletNumber) {
  logger.step(`--- Transaction For Wallet ${walletNumber} (Cycle ${cycleNumber}) ---`);
  const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, { gasPrice: GAS_PRICE });
  const zigBalance = await getBalance(client, address, DENOM_ZIG);
  logger.info(`Initial ZIG balance: ${zigBalance}`);
  let successfulSwaps = 0;

  for (let i = 0; i < TOKENS.length; i++) {
    const token = TOKENS[i];
    if (!token.pairContract) continue;
    const balance = zigBalance;
    if (balance < 0.0001) { logger.warn(`Skipping swap to ${token.name}: insufficient balance`); continue; }
    const swapAmount = getRandomSwapAmount(balance);
    const result = await performSwap(wallet, address, swapAmount, token, i+1);
    if (result) successfulSwaps++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  logger.info(`All swaps done: ${successfulSwaps}/${TOKENS.length} successful`);
}

async function main() {
  logger.banner();
  const keys = Object.keys(process.env)
    .filter(k => k.startsWith('PRIVATE_KEY_'))
    .map(k => process.env[k]);

  if (!keys.length) {
    logger.error('No private keys or mnemonics found in .env');
    rl.close();
    return;
  }

  const input = await prompt('Enter number of transactions to execute: ');
  const numTransactions = parseInt(input);
  if (isNaN(numTransactions) || numTransactions <= 0) { logger.error('Invalid number'); rl.close(); return; }

  for (let walletIndex = 0; walletIndex < keys.length; walletIndex++) {
    const wallet = await getWallet(keys[walletIndex]);
    const address = await getAccountAddress(wallet);
    for (let cycle = 1; cycle <= numTransactions; cycle++) {
      await executeTransactionCycle(wallet, address, cycle, walletIndex + 1);
    }
  }

  rl.close();
}

main().catch(err => { logger.error(`Bot failed: ${err.message}`); rl.close(); });
