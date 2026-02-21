"use client"

import { useState, useEffect } from "react"
import { Contract } from "ethers"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWallet } from "./wallet-provider"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/components/contractInteraction/constant"

export function WithdrawCard() {
  const { address, isOnSepolia } = useWallet()
  const [contract, setContract] = useState<Contract | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [txSuccess, setTxSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum || !address) return

    async function init() {
      try {
        const { BrowserProvider } = await import("ethers")
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const fundContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        setContract(fundContract)
        const ownerAddr = await fundContract.getOwner()
        setIsOwner(ownerAddr.toLowerCase() === address.toLowerCase())
      } catch {
        setContract(null)
        setIsOwner(false)
      }
    }
    init()
  }, [address])

  async function handleWithdraw() {
    if (!contract || !address || !isOnSepolia || !isOwner) return
    setIsWithdrawing(true)
    setTxSuccess(false)
    setError(null)
    try {
      const tx = await contract.withdraw()
      await tx.wait()
      setTxSuccess(true)
      setTimeout(() => setTxSuccess(false), 4000)
      window.dispatchEvent(new Event("contractBalanceChanged"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdraw failed")
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (!address) return null

  if (!isOnSepolia) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Withdraw Funds</CardTitle>
          <CardDescription className="text-muted-foreground">
            Withdraw contract balance to your wallet (owner only). Switch to
            Sepolia.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isOwner) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Withdraw Funds</CardTitle>
          <CardDescription className="text-muted-foreground">
            Withdraw contract balance to your wallet. Owner only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Only the contract owner can withdraw funds.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Withdraw Funds</CardTitle>
        <CardDescription className="text-muted-foreground">
          Withdraw all funds from the contract to your wallet (owner only)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          onClick={handleWithdraw}
          disabled={!contract || isWithdrawing}
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Withdrawing...
            </>
          ) : (
            <>
              <ArrowUpRight className="size-4" />
              Withdraw Contract Funds
            </>
          )}
        </Button>

        {txSuccess && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-center">
            <p className="text-sm text-primary font-medium">
              Funds withdrawn successfully
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
