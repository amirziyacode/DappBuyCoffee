"use client"

import { useState, useEffect } from "react"
import { Contract } from "ethers"
import { formatEther, parseEther } from "ethers"
import { Coffee, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWallet } from "@/components/web3/wallet-provider"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constant"

export function BuyCoffeeCard() {
  const {
    address,
    balance,
    isOnSepolia,
    switchToSepolia,
    getBalance,
  } = useWallet()
  const [contract, setContract] = useState<Contract | null>(null)
  const [priceEth, setPriceEth] = useState<string | null>(null)
  const [owner, setOwner] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum || !address) return

    async function initContract() {
      try {
        const { BrowserProvider } = await import("ethers")
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const fundContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        setContract(fundContract)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to init contract")
      }
    }
    initContract()
  }, [address])

  useEffect(() => {
    if (!contract || !isOnSepolia) return

    async function fetchContractData() {
      setIsLoading(true)
      setError(null)
      try {
        const [priceRaw, ownerAddr] = await Promise.all([
          contract.getPrice(),
          contract.getOwner(),
        ])
        // getPrice() returns USD/ETH scaled - ethAmount for $5 = (5e18 * 1e18) / price
        const MINIMUM_USD = 5n * 10n ** 18n
        const ethFor5Usd = (MINIMUM_USD * 10n ** 18n) / priceRaw
        const minEthStr = formatEther(ethFor5Usd)
        setPriceEth(minEthStr)
        setOwner(ownerAddr)
        setAmount((a) => (a === "" ? minEthStr : a))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchContractData()
  }, [contract, isOnSepolia])

  async function handleBuyCoffee() {
    if (!contract || !address || !isOnSepolia || !amount) return
    setIsBuying(true)
    setError(null)
    try {
      let valueToSend: bigint
      try {
        valueToSend = parseEther(amount)
      } catch {
        setError("Please enter a valid ETH amount")
        return
      }
      const priceRaw = await contract.getPrice()
      const MINIMUM_USD = 5n * 10n ** 18n
      const minEth = (MINIMUM_USD * 10n ** 18n) / priceRaw
      if (valueToSend < minEth) {
        setError(`Minimum ${formatEther(minEth)} ETH (~$5) required`)
        return
      }
      const tx = await contract.buyCoffe({ value: valueToSend })
      await tx.wait()
      getBalance()
      window.dispatchEvent(new Event("contractBalanceChanged"))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed"
      const isInsufficientFunds = /insufficient funds/i.test(msg)
      setError(
        isInsufficientFunds
          ? "Insufficient Sepolia ETH. Get more from sepoliafaucet.com"
          : msg
      )
    } finally {
      setIsBuying(false)
    }
  }

  function setMinAmount() {
    if (priceEth) setAmount(priceEth)
  }

  if (!address) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="size-5" />
            Buy Coffee
          </CardTitle>
          <CardDescription>
            Connect your wallet to buy a coffee on Sepolia.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isOnSepolia) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="size-5" />
            Buy Coffee
          </CardTitle>
          <CardDescription>
            Switch to Sepolia test network to interact with the contract.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={switchToSepolia} className="w-full gap-2">
            Switch to Sepolia
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="size-5" />
          Buy Coffee
        </CardTitle>
        <CardDescription>
          Send at least $5 worth of ETH to support. Contract on Sepolia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading contract data...
          </div>
        ) : (
          <div className="space-y-2 rounded-lg bg-secondary/50 px-3 py-2 font-mono text-sm">
            {priceEth && (
              <p>
                Price (~$5):{" "}
                <span className="text-foreground">{priceEth} ETH</span>
              </p>
            )}
            {balance !== null && priceEth && (
              <p className="text-muted-foreground">
                Your balance: {Number(balance).toFixed(6)} ETH
                {Number(balance) < Number(priceEth) * 1.1 && (
                  <span className="block text-amber-600 text-xs mt-1">
                    Need more for gas. Get Sepolia ETH at sepoliafaucet.com
                  </span>
                )}
              </p>
            )}
            {owner && (
              <p className="truncate text-muted-foreground">
                Owner: {owner.slice(0, 10)}...{owner.slice(-8)}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="buy-amount"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            Amount (ETH)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="buy-amount"
                type="number"
                step="0.0001"
                min="0"
                placeholder={priceEth ?? "0.00"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!contract || isLoading || isBuying}
                className="pr-12 font-mono h-12 text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                ETH
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={setMinAmount}
              disabled={!priceEth || isLoading || isBuying}
              className="shrink-0"
            >
              Min
            </Button>
          </div>
        </div>

        <Button
          className="w-full gap-2"
          onClick={handleBuyCoffee}
          disabled={
            !contract ||
            !amount ||
            isLoading ||
            isBuying ||
            Number(amount) <= 0 ||
            (balance !== null &&
              priceEth !== null &&
              Number(balance) < Number(amount) * 1.05)
          }
        >
          {isBuying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Buying...
            </>
          ) : (
            <>
              <Coffee className="size-4" />
              Buy Coffee
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
