# ☕ DAppFund – Web3 Donation App

**Live Demo:**  
https://dapp-buy-coffee-five.vercel.app/

A decentralized donation platform built with **Next.js** and **Solidity**, where users can connect with **MetaMask** and donate ETH (like buying a coffee ☕) directly on the blockchain.

---

## 🚀 Features

- 🦊 Connect with **MetaMask** wallet  
- 💸 Send ETH donations to the smart contract  
- 🌐 Works on **Sepolia Testnet**  
- 📊 View contract balance  
- 🔐 Smart contract tested with Foundry  

---

## 🛠 Tech Stack

### Frontend
- Next.js  
- React  
- Ethers.js / Viem  
- Tailwind CSS  

### Blockchain
- Solidity (0.8.x)  
- Foundry (Testing & Deployment)  
- Sepolia Testnet  

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🔌 How It Works

1. Open the website.  
2. Connect your MetaMask wallet.  
3. Switch to Sepolia network.  
4. Enter the amount of ETH.  
5. Click **Buy Coffee** and confirm the transaction.  
6. The ETH is sent directly to the smart contract.  
7. The contract balance updates on-chain.  

---

## 🧾 Smart Contract

The smart contract:

- Accepts ETH donations  
- Stores funders  
- Tracks total balance  
- Allows only the owner to withdraw  

---

## 🧪 Run Smart Contract Tests

```bash
forge test
```

---

## 🌍 Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## 💡 Future Improvements

- Add donation history  
- Multi-network support  
- Better UI/UX  
- Backend indexing (The Graph)  

---

## 📜 License

MIT License
