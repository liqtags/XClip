import dotenv from "npm:dotenv";
dotenv.config();
import {
  createWalletFromPrivateKey,
  options,
  parsedArgs,
  scraper,
  checkIfAccountDidAnyTweets
} from "./internal.ts";

if (!parsedArgs.account) {
  console.error(
    "Please provide a Solana account to monitor with the --account flag",
  );
  Deno.exit(1);
}

/**
 * Main function that logs into Twitter and starts monitoring for tweets
 */
async function main() {
  // make sure private key is provided
  if (!options.privateKey) {
    console.error("Please provide a private key with the --private-key flag");
    Deno.exit(1);
  }
  let wallet = null; // This is a placeholder value, it will be set later
  try {
    wallet = createWalletFromPrivateKey(options.privateKey as string);
  } catch (error) {
    console.error("Error creating wallet from private key:");
    Deno.exit(1);
  }

  try {
    await scraper.login(
      options.twitterUsername as string,
      options.twitterPassword as string,
    );
  } catch (error) {
    console.error("Error logging into Twitter:");
    Deno.exit(1);
  }

  try {
    // Do initial check
    await checkIfAccountDidAnyTweets(wallet);
  } catch (error) {
    console.error("Error checking for tweets:");
    Deno.exit(1);
  }

  // Check for new tweets every 5 seconds
  setInterval(async () => {
    await checkIfAccountDidAnyTweets(wallet);
  }, options.delayInCheck as any);
}

await main();
