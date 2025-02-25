# XClip
An Application for Clipping Solana Pump Address automatically by scraping someones X account. 

See the main.ts file with comments, it explains each line of code you are running

# How to use
- Install Deno on your computer by running ```curl -fsSL https://deno.land/install.sh | sh in the terminal```
- Change the .env.exmple to .env and fill it in
- run deno run --allow-all main.ts --account=kanyewest

# Env
```
PRIVATE_KEY=your_private_key
AMOUNT=your_amount
MAX_SOL_COST=0.0001
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
DELAY_IN_CHECK=5000
RPC_URL=https://api.devnet.solana.com
```

# Functions
- buyTokenOnPumpFun
- getAssociatedTokenAddress
- getPumpfunKeyPairs
- checkIfAccountDidAnyTweets
- getTokenAmountForSolanaAmount
- createWalletFromPrivateKey
