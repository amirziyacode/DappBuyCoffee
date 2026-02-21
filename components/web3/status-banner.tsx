"use client"

import { AlertCircle, ExternalLink, Wallet } from "lucide-react"
import { useWallet } from "./wallet-provider"

export function StatusBanner() {
  const { address, error } = useWallet()
  const isSwitchError = error?.toLowerCase().includes("switch") ||
    error?.toLowerCase().includes("cancel") ||
    error?.toLowerCase().includes("chain")

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
        {isSwitchError && (
          <a
            href="https://chainlist.org/chain/11155111"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Add Sepolia manually <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    )
  }

  if (!address) {
    return (
      <div className="rounded-lg bg-secondary border border-border/50 px-4 py-3 flex items-center gap-3">
        <Wallet className="size-4 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          Connect your wallet to get started
        </p>
      </div>
    )
  }

  return null
}
