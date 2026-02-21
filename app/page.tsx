"use client"

import { WalletProvider } from "@/components/web3/wallet-provider"
import { Header } from "@/components/web3/header"
import { BalanceCard } from "@/components/web3/balance-card"
import { BuyCoffeeCard } from "@/components/contractInteraction/buy-coffee-card"
import { WithdrawCard } from "@/components/web3/withdraw-card"
import { StatusBanner } from "@/components/web3/status-banner"

export default function Home() {
  return (
    <WalletProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />

        <main className="flex-1 flex items-start justify-center px-4 py-10 md:py-16">
          <div className="w-full max-w-lg flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                Wallet Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your funds, check balances, and send transactions.
              </p>
            </div>

            <StatusBanner />
            <BuyCoffeeCard />
            <BalanceCard />
            <WithdrawCard />

            <footer className="text-center pt-4">
              <p className="text-xs text-muted-foreground/60">
                Ensure you are connected to the correct network before transacting.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </WalletProvider>
  )
}
