import { ComputeBudgetProgram, spl, Buffer, BN, PublicKey, TransactionInstruction, Transaction } from "./external.ts";
import { connection } from "./internal.ts";

/**
 * Executes a transaction to buy pump tokens
 * 
 * @param {Object} pumpKeys - The keys related to the pump token
 * @param {number} buyTokensAmountRaw - The amount of tokens to buy
 * @returns {string} - The transaction signature
 */
export async function buyTokenOnPumpFun(wallet, pumpKeys, buyTokensAmountRaw) {
  // Set compute budget for the transaction (increases likelihood of inclusion in a block)
  let computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({microLamports: 2050000});
  
  // No maximum cost limit
  // this is to max sure we get in as many other will be trying to buy at the same time
  const maxSolCostRaw = 99999999999;
  
  // Instruction to create Associated Token Account if it doesn't exist
  const createAssociatedTokenAccount = spl.createAssociatedTokenAccountIdempotentInstruction(
    wallet.publicKey,
    pumpKeys.userAssociatedToken,
    wallet.publicKey,
    pumpKeys.mint
  );
  
  // Prepare the instruction data buffer for the buy instruction
  const buffer = Buffer.alloc(24);
  
  // Create an object with the parameters
  const obj = { 
    amount: new BN(buyTokensAmountRaw), 
    maxSolCost: new BN(maxSolCostRaw) 
  };
  
  // Write the buy instruction discriminator
  Buffer.from("66063d1201daebea", "hex").copy(buffer, 0);
  
  // Write the amount of tokens to buy
  obj.amount.toArrayLike(Buffer, 'le', 8).copy(buffer, 8);
  
  // Write the maximum SOL cost
  obj.maxSolCost.toArrayLike(Buffer, 'le', 8).copy(buffer, 16);
  
  // Define the accounts needed for the buy instruction
  const accountMetas = [
    { pubkey: new PublicKey(pumpKeys.global), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(pumpKeys.feeRecipient), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(pumpKeys.mint), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(pumpKeys.bonding), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(pumpKeys.associatedBondingCurve), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(pumpKeys.userAssociatedToken), isSigner: false, isWritable: true },
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: new PublicKey(pumpKeys.systemProgram), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(pumpKeys.tokenProgram), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(pumpKeys.rent), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(pumpKeys.sellEventAuthority), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(pumpKeys.program), isSigner: false, isWritable: false }
  ];
  
  // Create the buy instruction
  const programId = new PublicKey(pumpKeys.program);
  const instruction = new TransactionInstruction({ 
    keys: accountMetas, 
    programId, 
    data: buffer 
  });
  
  // Build and send the transaction
  const tx = new Transaction()
    .add(computeBudgetIx)
    .add(createAssociatedTokenAccount)
    .add(instruction);
  
  const txSignature = await connection.sendTransaction(tx, [wallet], { 
    skipPreflight: false, 
    preflightCommitment: "confirmed" 
  });
  
  // Wait for transaction confirmation
  let confirmed = false;
  while (!confirmed) {
    confirmed = await connection.confirmTransaction(txSignature, "processed");
    console.log("Transaction confirmed:", confirmed);
  }
  
  return txSignature;
}