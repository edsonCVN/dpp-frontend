"use client"

import { useState, useEffect } from "react"
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  Zap,
  ArrowRight,
  Network,
  Wallet,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProductPassport } from "@/components/product-card"
import { crossChainTransferDPP, getCrossChainStatus } from "@/lib/api"

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  passports: ProductPassport[]
}

type TransferStep = "form" | "locking" | "gateway" | "complete" | "error"

// Networks supported by the deployed SATP Hermes gateways.
// When the frontend is pointed at the chain-2 API (port 3003) the only valid
// destination is chain 1, and vice-versa.
const apiUrl   = process.env.NEXT_PUBLIC_CACTI_API_URL ?? "http://127.0.0.1:3002"
const isChain2 = apiUrl.includes("3003")

const networks = isChain2
  ? [{ id: "EthereumLedgerTestNetwork1", name: "Hardhat Chain 1 (Local EVM, port 8545)" }]
  : [{ id: "EthereumLedgerTestNetwork2", name: "Hardhat Chain 2 (Local EVM, port 8546)" }]

const recipientPlaceholder = isChain2
  ? "0x… (defaults to chain-1 owner from deployed-addresses.json)"
  : "0x… (defaults to chain-2 owner from deployed-addresses.json)"

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 60 // 2 min timeout

export function TransferModal({ isOpen, onClose, passports }: TransferModalProps) {
  const [step, setStep] = useState<TransferStep>("form")
  const [destinationNetwork, setDestinationNetwork] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionIds, setSessionIds] = useState<string[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("form")
        setDestinationNetwork("")
        setRecipientAddress("")
        setCurrentIndex(0)
        setSessionIds([])
        setCurrentSessionId("")
        setErrorMessage("")
      }, 300)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()

    const collected: string[] = []

    for (let i = 0; i < passports.length; i++) {
      setCurrentIndex(i)

      // ── Phase 1: Lock — call /cross-chain-transfer ─────────────────────────
      setStep("locking")
      let sessionId: string
      try {
        const result = await crossChainTransferDPP({
          dppId: passports[i].tokenId,
          receiverAddress: recipientAddress || undefined,
        })
        sessionId = result.sessionId
        collected.push(sessionId)
        setSessionIds([...collected])
        setCurrentSessionId(sessionId)
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Transfer request failed. Make sure both chains are running and deploy-dpp.js has been executed."
        setErrorMessage(msg)
        setStep("error")
        return
      }

      // ── Phases 2 & 3: Poll gateway until COMPLETED ────────────────────────
      setStep("gateway")
      let attempts = 0
      while (attempts < POLL_MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
        try {
          const status = await getCrossChainStatus(sessionId)
          const s = status?.status?.toUpperCase()
          const sub = status?.substatus?.toUpperCase()
          if (s === "DONE" || sub === "COMPLETED") break
          if (s === "FAILED" || s === "INVALID") {
            setErrorMessage(`SATP session failed: ${status?.error ?? "unknown error"}`)
            setStep("error")
            return
          }
        } catch {
          // Status endpoint may not respond immediately — keep polling
        }
        attempts++
      }

      if (attempts >= POLL_MAX_ATTEMPTS) {
        setErrorMessage(
          `Transfer timed out after ${(POLL_MAX_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s. ` +
            `Session ID: ${sessionId}. Check status manually via satp-check-status.py.`,
        )
        setStep("error")
        return
      }
    }

    setStep("complete")
  }

  const renderStepContent = () => {
    switch (step) {
      case "form":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Initialize Cross-Chain Transfer</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Transfer {passports.length} DPP{passports.length > 1 ? "s" : ""} to another network via SATP.
              </p>
            </div>

            <form onSubmit={handleTransfer} className="space-y-5">
              {/* Assets */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  {passports.length > 1 ? `Assets to Transfer (${passports.length})` : "Asset to Transfer"}
                </p>
                <div className={`space-y-2 ${passports.length > 3 ? "max-h-32 overflow-y-auto pr-1" : ""}`}>
                  {passports.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">Token #{p.tokenId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Network */}
              <div className="space-y-2">
                <Label htmlFor="network" className="flex items-center gap-2 text-sm">
                  <Network className="w-3.5 h-3.5 text-muted-foreground" />
                  Destination Network
                </Label>
                <Select value={destinationNetwork} onValueChange={setDestinationNetwork}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select destination network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.id} value={network.id}>
                        {network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <Label htmlFor="recipient" className="flex items-center gap-2 text-sm">
                  <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                  Recipient Address{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="recipient"
                  placeholder={recipientPlaceholder}
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="bg-secondary/50 border-border focus:border-primary font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the default {isChain2 ? "chain-1" : "chain-2"} receiver configured in <code>deploy-dpp.js</code>.
                </p>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-400">
                  <strong>Important:</strong> Once initiated,{" "}
                  {passports.length > 1 ? "all assets" : "the asset"} will be locked on the source
                  chain until the transfer completes. This process is irreversible.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full glow-primary"
                disabled={!destinationNetwork}
              >
                <Lock className="w-4 h-4 mr-2" />
                Initialize Transfer{passports.length > 1 ? ` (${passports.length} DPPs)` : ""}
              </Button>
            </form>
          </>
        )

      case "locking":
      case "gateway":
      case "complete":
        return (
          <div className="py-8">
            <h2 className="text-xl font-semibold text-center mb-2">Cross-Chain Transfer Progress</h2>
            {passports.length > 1 && (
              <p className="text-sm text-muted-foreground text-center mb-6">
                {step === "complete"
                  ? `All ${passports.length} DPPs transferred`
                  : `Processing ${currentIndex + 1} of ${passports.length} — ${passports[currentIndex]?.name}`}
              </p>
            )}

            {/* Session ID badge */}
            {currentSessionId && step !== "complete" && (
              <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">SATP Session ID</p>
                <p className="text-xs font-mono text-foreground break-all">{currentSessionId}</p>
              </div>
            )}

            {/* Progress Steps */}
            <div className="space-y-6">
              <TransferStepItem
                icon={<Lock className="w-5 h-5" />}
                title="Locking Asset on Source Chain"
                description="Calling lock() on the DPP contract — NFT moves to bridge custody"
                status={step === "locking" ? "active" : step === "gateway" || step === "complete" ? "complete" : "pending"}
              />

              <TransferStepItem
                icon={<Zap className="w-5 h-5" />}
                title="SATP Hermes — Phases 2 & 3"
                description={
                  step === "gateway"
                    ? `Mint + assign on destination chain… polling every ${POLL_INTERVAL_MS / 1000}s`
                    : step === "complete"
                    ? "mint() + assign() completed on destination chain"
                    : "Waiting for gateway to process"
                }
                status={step === "gateway" ? "active" : step === "complete" ? "complete" : "pending"}
              />

              <TransferStepItem
                icon={<CheckCircle className="w-5 h-5" />}
                title="Transfer Complete"
                description={`DPP${passports.length > 1 ? "s" : ""} successfully transferred to destination chain`}
                status={step === "complete" ? "complete" : "pending"}
              />
            </div>

            {/* Transferred Assets Summary */}
            {step === "complete" && passports.length > 1 && (
              <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <p className="text-xs text-muted-foreground mb-2">Transferred Assets ({passports.length})</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {passports.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                      <span className="truncate flex-1 text-foreground">{p.name}</span>
                      <span className="text-muted-foreground font-mono shrink-0">#{p.tokenId}</span>
                      {sessionIds[idx] && (
                        <span className="text-muted-foreground font-mono shrink-0 text-[10px]">
                          {sessionIds[idx].slice(0, 8)}…
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="mt-8 text-center animate-fade-in">
                <p className="text-sm text-muted-foreground mb-4">
                  {passports.length > 1
                    ? `${passports.length} Digital Product Passports have`
                    : "Your Digital Product Passport has"}{" "}
                  been successfully transferred to{" "}
                  <span className="text-primary font-medium">
                    {networks.find((n) => n.id === destinationNetwork)?.name ?? destinationNetwork}
                  </span>
                </p>
                {sessionIds.length === 1 && (
                  <p className="text-xs text-muted-foreground font-mono mb-4 break-all">
                    Session ID: {sessionIds[0]}
                  </p>
                )}
                <Button onClick={onClose} className="glow-primary">
                  Close
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )

      case "error":
        return (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Transfer Failed</h2>
            <p className="text-sm text-muted-foreground mb-4 break-words">{errorMessage}</p>
            {currentSessionId && (
              <p className="text-xs text-muted-foreground font-mono mb-6 break-all">
                Session ID: {currentSessionId}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setStep("form")
                  setErrorMessage("")
                  setSessionIds([])
                  setCurrentSessionId("")
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={step === "form" ? onClose : undefined}
      />

      <div className="relative glass-card rounded-2xl p-6 w-full max-w-lg mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        {step === "form" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {renderStepContent()}
      </div>
    </div>
  )
}

function TransferStepItem({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: "pending" | "active" | "complete"
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
        status === "active"
          ? "bg-primary/10 border border-primary/30"
          : status === "complete"
          ? "bg-green-500/10 border border-green-500/30"
          : "bg-secondary/30 border border-border opacity-50"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          status === "active"
            ? "bg-primary/20 text-primary"
            : status === "complete"
            ? "bg-green-500/20 text-green-400"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {status === "active" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === "complete" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          icon
        )}
      </div>
      <div>
        <p
          className={`font-medium ${
            status === "complete"
              ? "text-green-400"
              : status === "active"
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
