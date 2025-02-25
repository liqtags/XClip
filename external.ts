/**
 * External dependencies
 * 
 * This file is used to import external dependencies and for managing them in one file for better organization.
 */

import { Scraper } from 'npm:@the-convocation/twitter-scraper';
import { 
  PublicKey, 
  Connection, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction, 
  Keypair, 
  ComputeBudgetProgram, 
  LAMPORTS_PER_SOL 
} from 'npm:@solana/web3.js';
import * as spl from "npm:@solana/spl-token";
import { struct, u32, u8 } from 'npm:@solana/buffer-layout';
import { u64, publicKey, bool } from "npm:@solana/buffer-layout-utils";
import BN from "npm:bn.js";
import bs58 from "npm:bs58";
import { Buffer } from "node:buffer";
import { parseArgs } from "jsr:@std/cli/parse-args";

export {
    Scraper,
    PublicKey,
    Connection,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    Keypair,
    ComputeBudgetProgram,
    LAMPORTS_PER_SOL,
    spl,
    struct,
    u32,
    u8,
    u64,
    publicKey,
    bool,
    BN,
    bs58,
    Buffer,
    parseArgs
}