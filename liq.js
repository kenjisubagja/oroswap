import fs from "fs";
import dotenv from "dotenv";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

dotenv.config();
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

const logger = {
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
const RPC_ENDPOINT = "https://rpc.zigscan.net/";
const BASE_AMOUNT = "1000"; // 

// ======================= Fungsi Utility =======================
// ======================= Fungsi Utility =======================
async function validatePools(client, pools) {
  const validPools = [];
  for (const addr of pools) {
    try {
      const poolInfo = await client.queryContractSmart(addr, { pool: {} });

      if (poolInfo.assets && poolInfo.assets.length === 2) {
        const denom1 = poolInfo.assets[0]?.info?.native_token?.denom;
        const denom2 = poolInfo.assets[1]?.info?.native_token?.denom;

        if (!denom1 || !denom2) {
          console.log(`⚠️ Skip ${addr}, denom undefined`);
          continue;
        }

        console.log(`✅ Pool valid: ${addr}`);
        validPools.push({ addr, poolInfo });
      } else {
        console.log(`⚠️ Pool ${addr} tidak punya struktur assets`);
      }
    } catch (err) {
      console.log(`⚠️ Skip ${addr}, pool info tidak valid (${err.message})`);
    }
  }
  return validPools;
}

function calcOtherAmount(poolInfo, baseDenom, baseAmount) {
  const [asset1, asset2] = poolInfo.assets;

  let baseAsset, otherAsset;
  if (asset1.info.native_token?.denom === baseDenom) {
    baseAsset = asset1;
    otherAsset = asset2;
  } else if (asset2.info.native_token?.denom === baseDenom) {
    baseAsset = asset2;
    otherAsset = asset1;
  } else {
    throw new Error(`Pool tidak mengandung denom ${baseDenom}`);
  }

  const ratio = Number(otherAsset.amount) / Number(baseAsset.amount);
  const otherAmount = Math.floor(Number(baseAmount) * ratio).toString();

  return {
    otherAmount,
    otherDenom: otherAsset.info.native_token.denom,
  };
}

async function addLiquidity(client, sender, poolAddr, poolInfo) {
  try {
    const { otherAmount, otherDenom } = calcOtherAmount(
      poolInfo,
      "uzig",
      BASE_AMOUNT
    );

    const msg = {
      provide_liquidity: {
        assets: [
          {
            info: { native_token: { denom: "uzig" } },
            amount: BASE_AMOUNT,
          },
          {
            info: { native_token: { denom: otherDenom } },
            amount: otherAmount,
          },
        ],
        slippage_tolerance: "0.05", // ✅ max 5% slippage
      },
    };

    const fee = {
      amount: [{ denom: "uzig", amount: "5000" }],
      gas: "600000",
    };

    let funds = [
      { denom: "uzig", amount: BASE_AMOUNT },
      { denom: otherDenom, amount: otherAmount },
    ];

    // ✅ urutkan denom biar sesuai
    funds.sort((a, b) => a.denom.localeCompare(b.denom));

    const tx = await client.execute(
      sender.address,
      poolAddr,
      msg,
      fee,
      undefined,
      funds
    );

    console.log(`✅ Success add liquidity ke ${poolAddr}, Tx: ${tx.transactionHash}`);
  } catch (err) {
    console.log(`❌ Gagal add liquidity ke ${poolAddr}: ${err.message}`);
  }
}



// ======================= MAIN =======================
async function main() {
  logger.banner();
  const mnemonic = process.env.PRIVATE_KEY_1;
  if (!mnemonic) throw new Error("PRIVATE_KEY_1 tidak ditemukan di .env");

  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "zig",
  });
  const [account] = await wallet.getAccounts();
  console.log("Wallet address:", account.address);

  const client = await SigningCosmWasmClient.connectWithSigner(
    RPC_ENDPOINT,
    wallet
  );

  const pools = [
    "zig1vhr7hx0yeww0uwe2zlp6mst5g6aup85engzntlyv52rkmxsykvdskfv0tu",
    "zig1k0728vraxvf7gn3dptlnlwk5etrwlfd2yagf5u9jnsj9x7wpskds9xhjya",
    "zig1ymjmap5rj3pg2lye654923df3ccz6zgcuku6t5a4nglh6ed42zsqmht0lf",
    "zig17wzgjl65rdtz6upuppquda48mea9k6ct2kl3thwn5w6cuw8kz3nsy409xd",
    "zig19zqxslng99gw98ku3dyqaqy0c809kwssw7nzhea9x40jwxjugqvs5xaghj",
    "zig1x9ayv267jnpvfmjmja4wk037w00uz4g0x5pyh6yeut0my3hhpfqq4wg3mk",
    "zig10fwkyedm2p3v50p8q078v9qy4tfc04dqkzm8ux74mp0yd5yaf06q86vdc4",
    "zig1eqggyhjj23cl3r7j5apnyg7mxrm639zeh46xq24eeccdh922mxjqq0kd4h",



    // tambahkan pool lain di sini kalau lu mau dan hafal pair_addr nya
  ];

  const validPools = await validatePools(client, pools);

  for (const { addr, poolInfo } of validPools) {
    console.log(`🚀 Adding liquidity ke pool ${addr} ...`);
    await addLiquidity(client, account, addr, poolInfo);
  }
}

main();
