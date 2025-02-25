# XClip
XClip is an application that automatically extracts Solana pump addresses by scraping an X (formerly Twitter) account. This tool helps track and interact with token movements in Solana by monitoring social media activity.

Twitter's API is annoying to work with, and has lots of limitations — luckily there is this lib [Twitter Scraper by the-convocation](https://github.com/the-convocation/twitter-scraper)

## Features

- Scrapes specified X accounts for relevant token-related tweets.
- Extracts and processes Solana pump addresses.
- Provides an automated way to track trending tokens.

## Prerequisites

- Deno (a runtime for JavaScript and TypeScript)
- X (Twitter) account details
- Solana Private Key

## Prerequisites
- Install Deno ```curl -fsSL https://deno.land/install.sh | sh```
- Clone or download this repo
- Rename .env.example to .env and place there your values 
- Run ```deno run --allow-all main.ts --account=kanyewest```

# Functions
- buyTokenOnPumpFun
- getAssociatedTokenAddress
- getPumpfunKeyPairs
- checkIfAccountDidAnyTweets
- getTokenAmountForSolanaAmount
- createWalletFromPrivateKey
