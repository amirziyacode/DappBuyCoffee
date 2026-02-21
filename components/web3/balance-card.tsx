"use client"

import { RefreshCw } from "lucide-react"
import { formatEther } from "ethers"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWallet } from "./wallet-provider"
import { useState, useEffect, useCallback } from "react"
import { CONTRACT_ADDRESS } from "@/components/contractInteraction/constant"

export function BalanceCard() {
  const { address, isOnSepolia } = useWallet()
  const [contractBalance, setContractBalance] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchContractBalance = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum || !isOnSepolia)
      return
    try {
      const { BrowserProvider } = await import("ethers")
      const provider = new BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(CONTRACT_ADDRESS)
      setContractBalance(formatEther(balance))
    } catch {
      setContractBalance(null)
    }
  }, [isOnSepolia])

  useEffect(() => {
    fetchContractBalance()
  }, [fetchContractBalance])

  useEffect(() => {
    const onBalanceChanged = () => fetchContractBalance()
    window.addEventListener("contractBalanceChanged", onBalanceChanged)
    return () =>
      window.removeEventListener("contractBalanceChanged", onBalanceChanged)
  }, [fetchContractBalance])

  async function handleRefresh() {
    setIsRefreshing(true)
    await fetchContractBalance()
    setIsRefreshing(false)
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardDescription className="text-muted-foreground text-xs uppercase tracking-widest">
          Contract Balance
        </CardDescription>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight text-foreground font-mono">
            {address && isOnSepolia && contractBalance !== null
              ? Number(contractBalance).toFixed(4)
              : !isOnSepolia
                ? "—"
                : "0.0000"}
          </span>
          <span className="text-lg text-muted-foreground font-medium">ETH</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isOnSepolia && (
          <p className="text-sm text-muted-foreground mb-2">
            Switch to Sepolia to view fund balance
          </p>
        )}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleRefresh}
          disabled={!address || isRefreshing}
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Get Balance"}
        </Button>
      </CardContent>
    </Card>
  )
}
