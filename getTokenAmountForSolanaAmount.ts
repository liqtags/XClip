import { bondingLayout, connection, options } from "./internal.ts";

/**
 * Calculates the amount of tokens that can be purchased with the specified amount of SOL
 * based on the current bonding curve state
 * 
 * @param {Object} pumpKeys - The keys related to the pump token
 * @returns {number} - The amount of tokens that can be purchased
 */
export async function getTokenAmountForSolanaAmount(pumpKeys: any): Promise<number> {
    // Get the current state of the bonding curve
    const info = await connection.getAccountInfo(pumpKeys.bonding);

    if (!info) {
      throw new Error("Error fetching bonding curve account data");
    }
    
    // Decode the account data (skip the first 8 bytes which is usually a discriminator)
    const bonding: any = bondingLayout.decode(info.data.slice(8, 1000));

    if (!bonding) {
      throw new Error("Error decoding bonding curve account data");
    }
    
    // Extract the virtual reserves
    const virtualSol = bonding.virtualSolReserves;
    const virtualToken = bonding.virtualTokenReserves;
    
    // Calculate the current price based on the virtual reserves ratio
    const price = Number(virtualSol) / Number(virtualToken);
    
    // Calculate how many tokens we can get for our SOL amount
    const tokensAmount = options.solAmount / price;
    
    return tokensAmount;
  }