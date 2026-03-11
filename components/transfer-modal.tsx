"use client"

import { useState, useEffect } from "react"
import {
  X,
  Loader2,
  CheckCircle,
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

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  passports: ProductPassport[]
}

type TransferStep = "form" | "locking" | "gateway" | "complete"

const networks = [
  { id: "ethereum", name: "Ethereum Mainnet" },
  { id: "polygon", name: "Polygon PoS" },
  { id: "arbitrum", name: "Arbitrum One" },
  { id: "optimism", name: "Optimism" },
  { id: "avalanche", name: "Avalanche C-Chain" },
]

export function TransferModal({ isOpen, onClose, passports }: TransferModalProps) {
  const [step, setStep] = useState<TransferStep>("form")
  const [destinationNetwork, setDestinationNetwork] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("form")
        setDestinationNetwork("")
        setRecipientAddress("")
        setCurrentIndex(0)
      }, 300)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()

    for (let i = 0; i < passports.length; i++) {
      setCurrentIndex(i)

      // Step 1: Locking
      setStep("locking")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Step 2: Gateway
      setStep("gateway")
      await new Promise((resolve) => setTimeout(resolve, 2500))
    }

    // Step 3: Complete
    setStep("complete")
  }

  const renderStepContent = () => {
    switch (step) {
      case "form":
        return (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Initialize Cross-Chain Transfer</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Transfer {passports.length} DPP{passports.length > 1 ? "s" : ""} to another network via SATP.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleTransfer} className="space-y-5">
              {/* Assets Info */}
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

              <div className="space-y-2">
                <Label htmlFor="network" className="flex items-center gap-2 text-sm">
                  <Network className="w-3.5 h-3.5 text-muted-foreground" />
                  Destination Network ID
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

              <div className="space-y-2">
                <Label htmlFor="recipient" className="flex items-center gap-2 text-sm">
                  <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                  Recipient Address
                </Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  required
                  className="bg-secondary/50 border-border focus:border-primary font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The wallet address that will receive the DPP{passports.length > 1 ? "s" : ""} on the destination network.
                </p>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-400">
                  <strong>Important:</strong> Once initiated, {passports.length > 1 ? "all assets" : "the asset"} will be locked on the source chain
                  until the transfer completes. This process is irreversible.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full glow-primary"
                disabled={!destinationNetwork || !recipientAddress}
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

            {/* Progress Steps */}
            <div className="space-y-6">
              {/* Step 1: Locking */}
              <TransferStepItem
                icon={<Lock className="w-5 h-5" />}
                title="Locking Asset on Source Ledger (EVM)"
                description={`Securing ${passports.length > 1 ? "DPP tokens" : "the DPP token"} in the escrow smart contract`}
                status={step === "locking" ? "active" : step === "gateway" || step === "complete" ? "complete" : "pending"}
              />

              {/* Step 2: Gateway */}
              <TransferStepItem
                icon={<Zap className="w-5 h-5" />}
                title="Initiating SATP Hermes Gateway"
                description="Establishing secure cross-chain communication channel"
                status={step === "gateway" ? "active" : step === "complete" ? "complete" : "pending"}
              />

              {/* Step 3: Complete */}
              <TransferStepItem
                icon={<CheckCircle className="w-5 h-5" />}
                title="Transfer Complete!"
                description={`${passports.length > 1 ? "All assets" : "Asset"} successfully transferred to destination network`}
                status={step === "complete" ? "complete" : "pending"}
              />
            </div>

            {/* Transferred Assets Summary */}
            {step === "complete" && passports.length > 1 && (
              <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <p className="text-xs text-muted-foreground mb-2">Transferred Assets ({passports.length})</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {passports.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                      <span className="truncate flex-1 text-foreground">{p.name}</span>
                      <span className="text-muted-foreground font-mono shrink-0">#{p.tokenId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="mt-8 text-center animate-fade-in">
                <p className="text-sm text-muted-foreground mb-4">
                  {passports.length > 1 ? `${passports.length} Digital Product Passports have` : "Your Digital Product Passport has"} been successfully transferred to{" "}
                  <span className="text-primary font-medium">
                    {networks.find((n) => n.id === destinationNetwork)?.name}
                  </span>
                </p>
                <Button onClick={onClose} className="glow-primary">
                  Close
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={step === "form" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-lg mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Close button - only show on form step */}
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
    <div className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
      status === "active"
        ? "bg-primary/10 border border-primary/30"
        : status === "complete"
        ? "bg-green-500/10 border border-green-500/30"
        : "bg-secondary/30 border border-border opacity-50"
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        status === "active"
          ? "bg-primary/20 text-primary"
          : status === "complete"
          ? "bg-green-500/20 text-green-400"
          : "bg-secondary text-muted-foreground"
      }`}>
        {status === "active" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === "complete" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          icon
        )}
      </div>
      <div>
        <p className={`font-medium ${
          status === "complete" ? "text-green-400" : status === "active" ? "text-primary" : "text-muted-foreground"
        }`}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
