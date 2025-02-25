import dotenv from 'npm:dotenv';
dotenv.config();
import { bs58, Connection, Keypair, LAMPORTS_PER_SOL, parseArgs, PublicKey, Scraper, struct, u64, u8 } from "./external.ts";
import { getTokenAmountForSolanaAmount } from './getTokenAmountForSolanaAmount.ts';
import { buyTokenOnPumpFun } from './buyTokenOnPumpFun.ts';
import { checkIfAccountDidAnyTweets } from './checkIfAccountDidAnyTweets.ts';

// Parse command line arguments

let parsedArgs = parseArgs(Deno.args);

// Configuration
// ------------------------------------------------------------
// RPC endpoint for Solana mainnet
const rpcUrl = process.env.RPC_URL as string // Consider using a better RPC provider for reliability like helius
const connection = new Connection(rpcUrl);

// Program and account addresses
const pumpProgram = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
const mpl = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"); // Metaplex token metadata program

// Define the structure of the bonding curve account data
const bondingLayout = struct([
  u64('virtualTokenReserves'),
  u64('virtualSolReserves'), 
  u64('realTokenReserves'), 
  u64('realSolReserves'), 
  u64('supply'), 
  u8('completed')
]);

function createWalletFromPrivateKey(privateKeyString) {
  const privateKeyUint8Array = bs58.decode(privateKeyString);
  const keypair = Keypair.fromSecretKey(privateKeyUint8Array);
  return keypair;
}

const options = {
  privateKey: process.env.PRIVATE_KEY,
  amount: process.env.AMOUNT,
  maxSolCost: process.env.MAX_SOL_COST,
  twitterUsername: process.env.TWITTER_USERNAME,
  twitterPassword: process.env.TWITTER_PASSWORD,
  accountToMonitor: parsedArgs.account,
  solAmount: process.env.MAX_SOL_COST * LAMPORTS_PER_SOL,
  delayInCheck: process.env.DELAY_IN_CHECK,
}

// Twitter scraping configuration
// ------------------------------------------------------------
const scraper = new Scraper();
let lastSeenTweetId = null;

export {
    connection,
    pumpProgram,
    mpl, 
    bondingLayout,
    options, 
    parsedArgs,
    getTokenAmountForSolanaAmount,
    buyTokenOnPumpFun,
    scraper,
    lastSeenTweetId,
    createWalletFromPrivateKey,
    checkIfAccountDidAnyTweets
}