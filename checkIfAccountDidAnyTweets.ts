import { buyTokenOnPumpFun } from "./buyTokenOnPumpFun.ts";
import { bs58, Buffer, PublicKey, spl } from "./external.ts";
import { getTokenAmountForSolanaAmount } from "./getTokenAmountForSolanaAmount.ts";
import { scraper, mpl, pumpProgram, options } from "./internal.ts";

let lastSeenTweetId = null; // Last tweet ID we processed

/**
 * Gets the Associated Token Account address for a given mint and owner
 *
 * @param {PublicKey} mint - The mint address
 * @param {PublicKey} pubkey - The owner's public key
 * @returns {PublicKey} - The Associated Token Account address
 */
async function getAssociatedTokenAddress(mint: any, pubkey: any) {
  const foundAta = PublicKey.findProgramAddressSync(
    [pubkey.toBuffer(), spl.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    spl.ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];

  return foundAta;
}

/**
 * Derives all the necessary keys and addresses for interacting with a pump token
 *
 * @param {PublicKey} mint - The mint address of the pump token
 * @returns {Object} - An object containing all the necessary keys
 */
async function getPumpfunKeyPairs(wallet, mint) {
  let pumpKeys = {};

  // Program addresses
  const program = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
  const mplTokenMetadata = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );

  // Authority addresses
  const mintAuthority = new PublicKey(
    "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM",
  );
  const eventAuthority = new PublicKey(
    "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1",
  );
  const sellEventAuthority = new PublicKey(
    "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1",
  );

  // Fee recipient
  const feeRecipient = new PublicKey(
    "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
  );

  // System addresses
  const rent = new PublicKey("SysvarRent111111111111111111111111111111111");

  // Derive PDA addresses
  const seeds = [
    Buffer.from("global", "utf-8"),
    Buffer.from("bonding-curve", "utf-8"),
    Buffer.from("metadata", "utf-8"),
  ];

  // Global account
  const global = PublicKey.findProgramAddressSync([seeds[0]], program)[0];

  // Metadata account
  const metaData = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), mpl.toBuffer(), mint.toBuffer()],
    mpl,
  )[0];

  // User's token account
  const userAssociatedToken = await getAssociatedTokenAddress(
    mint,
    wallet.publicKey,
  );

  // Bonding curve account
  const bonding = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint.toBuffer()],
    pumpProgram,
  )[0];

  // Bonding curve's token account
  const associatedBondingCurve = await getAssociatedTokenAddress(mint, bonding);

  // Populate the keys object
  pumpKeys.metadata = metaData;
  pumpKeys.userAssociatedToken = userAssociatedToken;
  pumpKeys.associatedBondingCurve = associatedBondingCurve;
  pumpKeys.user = wallet.publicKey;
  pumpKeys.mint = mint;
  pumpKeys.bonding = bonding;
  pumpKeys.mintAuthority = mintAuthority;
  pumpKeys.global = global;
  pumpKeys.mplTokenMetadata = mplTokenMetadata;
  pumpKeys.systemProgram = SystemProgram.programId; // Use SystemProgram.programId instead of PublicKey.default
  pumpKeys.tokenProgram = spl.TOKEN_PROGRAM_ID;
  pumpKeys.associatedTokenProgram = spl.ASSOCIATED_TOKEN_PROGRAM_ID;
  pumpKeys.rent = rent;
  pumpKeys.eventAuthority = eventAuthority;
  pumpKeys.program = program;
  pumpKeys.sellEventAuthority = sellEventAuthority;
  pumpKeys.feeRecipient = feeRecipient;

  return pumpKeys;
}

/**
 * Checks for new tweets from the target account and processes them
 *
 * check for exckreetions
 */
export async function checkIfAccountDidAnyTweets(wallet, account) {
  try {
    // Get the latest tweet from the target account
    // Change 'kanyewest' to the Twitter handle you want to monitor
    const tweet = await scraper.getLatestTweet(account, false);

    // If no tweet found or it's the same as the last one we processed, do nothing
    if (!tweet || tweet.id === lastSeenTweetId) {
      console.log("No new tweets found");
      return;
    }

    // Update the last seen tweet ID
    lastSeenTweetId = tweet.id;

    // Log tweet information
    console.log("\nNew tweet found:");
    console.log(`Text: ${tweet.text}`);
    console.log(`Time: ${tweet.timeParsed}`);
    console.log(`URL: ${tweet.permanentUrl}`);

    // Look for potential Solana addresses in the tweet
    // Regular expression to match base58 encoded strings (likely Solana addresses)
    const base58Regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const base58Matches = tweet.text.match(base58Regex);

    if (base58Matches) {
      console.log("\nBase58 strings found:");

      // Process each potential Solana address
      for (const address of base58Matches) {
        let pumpKeys;

        try {
          // Verify if it's a valid 32-byte public key
          if (bs58.decode(address).length === 32) {
            console.log("Found potential token address");

            // Skip a known address (likely to avoid false positives)
            if (address !== "GoL6RVGQFzTD7MdoNEHUQmNp6SgXBn6f9khxAW5Bpump") {
              // Get the necessary keys for the pump token
              pumpKeys = await getPumpfunKeyPairs(wallet, new PublicKey(address));
            }
          }
        } catch (e) {
          console.log("Error processing address:", e);
        }

        // If valid pump keys were found, attempt to buy the token
        if (pumpKeys) {
          console.log("Attempting to pump token:", address);

          // Continuously try to buy the token
          while (true) {
            try {
              // Calculate how many tokens we can get for our SOL amount
              const tokensAmount = await getTokenAmountForSolanaAmount(
                pumpKeys,
                options.solAmount,
              );

              // Execute the buy transaction
              await buyTokenOnPumpFun(wallet, pumpKeys, tokensAmount);
              // console.log("buying");
            } catch (error) {
              console.log("Error buying token:", error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking for tweets:", error);
  }
}
