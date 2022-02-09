## Fanclub

This is a demo project integrated with [CyberConnect](https://cyberconnect.me/) where you can follow a specific address and mint an membership NFT by becoming of a "fan" of the target address.
Date fetched from [cyberconnect API](https://api.cybertino.io/connect/graphiql).

<p align="center">
<img src="./public//demo-shot.jpg" width="1000" >
</p>

## Features

This app includes two features:

### 1. Follow/unfollow

The app allows the current logged in user to follow/unfollow a specific address.

### 2. Claim a membership NFT

The app allows the user to claim a membership NFT (ERC1155 Token) as long as the user followed the target address, and the user didn't have the same NFT.

You can check the memberhsip NFT collection from [opensea testnet](https://testnets.opensea.io/collection/fanclub-membership-v2).

<br>

<p align="center">
<img src="./public//NFT_Collection.png" width="500" >
</p>

## Getting Started

First, run the development server:

```bash
npm install
# then
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Second, create .env.development file.
<br/>

```bash
NEXT_PUBLIC_PRIVATE_KEY=
NEXT_PUBLIC_ALCHEMY_API_URL=
```

Meanwhile, we also need to run the local server for this app which you can clone from the [Fanclub-Server](https://github.com/BruceWangyq/Fanclub-Server).

You need to open another IDE, run the server:

```bash
npm install
# then
node index.js
```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.

Please leave the http://localhost:5000 window open while running the applicaiton.

![Cyberconnect](/public//cyberconnect-white.png)
