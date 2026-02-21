"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { BrowserProvider, formatEther, parseEther } from "ethers"

interface WalletState {
  address: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

const SEPOLIA_CHAIN_ID = 11155111
const SEPOLIA_PARAMS = {
  chainId: "0xaa36a7",
  chainName: "Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: [
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://rpc.sepolia.org",
    "https://sepolia.drpc.org",
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  getBalance: () => Promise<void>
  withdrawFunds: (amount: string, toAddress: string) => Promise<void>
  switchToSepolia: () => Promise<void>
  isOnSepolia: boolean
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  const connectWallet = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true, error: null }))

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask.")
      }

      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(accounts[0])

      setState({
        address: accounts[0],
        balance: formatEther(balance),
        chainId: Number(network.chainId),
        isConnecting: false,
        error: null,
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err instanceof Error ? err.message : "Failed to connect wallet",
      }))
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setState({
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null,
    })
  }, [])

  const refreshNetworkState = useCallback(async () => {
    if (!window.ethereum?.request) return
    try {
      const provider = new BrowserProvider(window.ethereum)
      const [network, accounts] = await Promise.all([
        provider.getNetwork(),
        provider.send("eth_requestAccounts", []),
      ])
      const balance =
        accounts[0] ? await provider.getBalance(accounts[0]) : 0n
      setState((s) => ({
        ...s,
        chainId: Number(network.chainId),
        address: accounts[0] ?? s.address,
        balance: accounts[0] ? formatEther(balance) : s.balance,
      }))
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return
    const eth = window.ethereum
    const onChainChanged = () => refreshNetworkState()
    const onAccountsChanged = (accounts: unknown[]) => {
      if (accounts.length === 0) disconnectWallet()
      else refreshNetworkState()
    }
    eth.on?.("chainChanged", onChainChanged)
    eth.on?.("accountsChanged", onAccountsChanged)
    return () => {
      eth.removeListener?.("chainChanged", onChainChanged)
      eth.removeListener?.("accountsChanged", onAccountsChanged)
    }
  }, [disconnectWallet, refreshNetworkState])

  const getBalance = useCallback(async () => {
    setState((s) => ({ ...s, error: null }))

    try {
      if (!state.address || !window.ethereum) {
        throw new Error("Wallet not connected")
      }

      const provider = new BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(state.address)

      setState((s) => ({
        ...s,
        balance: formatEther(balance),
        error: null,
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        error:
          err instanceof Error ? err.message : "Failed to retrieve balance",
      }))
    }
  }, [state.address])

  const switchToSepolia = useCallback(async () => {
    setState((s) => ({ ...s, error: null }))
    try {
      if (typeof window === "undefined" || !window.ethereum?.request) {
        throw new Error("No wallet detected.")
      }

      const eth = window.ethereum
      const chainIdHex = SEPOLIA_PARAMS.chainId

      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        })
      } catch (switchErr: unknown) {
        const code = (switchErr as { code?: number })?.code
        if (code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_PARAMS],
          })
          try {
            await eth.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: chainIdHex }],
            })
          } catch {
            /* Add may have already switched - refresh state */
          }
        } else {
          throw switchErr
        }
      }

      await refreshNetworkState()
      setState((s) => ({ ...s, error: null }))
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to switch to Sepolia"
      const code = typeof err === "object" && err !== null && "code" in err
        ? (err as { code: number }).code
        : undefined
      const userRejected = code === 4001
      setState((s) => ({
        ...s,
        error: userRejected ? "You cancelled the switch." : msg,
      }))
    }
  }, [refreshNetworkState])

  const withdrawFunds = useCallback(
    async (amount: string, toAddress: string) => {
      setState((s) => ({ ...s, error: null }))

      try {
        if (!state.address || !window.ethereum) {
          throw new Error("Wallet not connected")
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
          throw new Error("Please enter a valid amount")
        }

        if (!toAddress || toAddress.length !== 42) {
          throw new Error("Please enter a valid recipient address")
        }

        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()

        const tx = await signer.sendTransaction({
          to: toAddress,
          value: parseEther(amount),
        })

        await tx.wait()

        // Refresh balance after transaction
        const balance = await provider.getBalance(state.address)
        setState((s) => ({
          ...s,
          balance: formatEther(balance),
          error: null,
        }))
      } catch (err) {
        setState((s) => ({
          ...s,
          error:
            err instanceof Error ? err.message : "Transaction failed",
        }))
      }
    },
    [state.address]
  )

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        getBalance,
        withdrawFunds,
        switchToSepolia,
        isOnSepolia: state.chainId === SEPOLIA_CHAIN_ID,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
