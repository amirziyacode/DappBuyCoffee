"use client"

import { Hexagon, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function getNetworkName(chainId: number | null): string {
  switch (chainId) {
    case 1:
      return "Ethereum"
    case 5:
      return "Goerli"
    case 11155111:
      return "Sepolia"
    case 137:
      return "Polygon"
    case 80001:
      return "Mumbai"
    case 56:
      return "BSC"
    case 42161:
      return "Arbitrum"
    case 10:
      return "Optimism"
    default:
      return chainId ? `Chain ${chainId}` : "Unknown"
  }
}

export function Header() {
  const {
    address,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isOnSepolia,
    switchToSepolia,
  } = useWallet()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
          <Hexagon className="size-5 text-primary" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          DappFund
        </span>
      </div>

      <div className="flex items-center gap-3">
        {address && chainId && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
              <span
                className={`size-2 rounded-full animate-pulse ${
                  isOnSepolia ? "bg-green-500" : "bg-amber-500"
                }`}
              />
              <span className="text-xs font-mono text-muted-foreground">
                {getNetworkName(chainId)}
              </span>
            </div>
            {!isOnSepolia && (
              <Button
                variant="outline"
                size="sm"
                onClick={switchToSepolia}
                className="text-xs"
              >
                Switch to Sepolia
              </Button>
            )}
          </div>
        )}

        {address ? (
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
            className="font-mono text-xs gap-2"
          >
            <Wallet className="size-3.5" />
            {truncateAddress(address)}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={connectWallet}
            disabled={isConnecting}
            className="gap-2"
          >
            <Wallet className="size-3.5" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </div>
    </header>
  )
}
