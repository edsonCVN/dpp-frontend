"use client"

import { useState, useEffect } from "react"
import {
  X,
  Loader2,
  CheckCircle,
  Send,
  Wallet,
  Package,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ROLES, useRole } from "@/contexts/role-context"
import { transferDPP } from "@/lib/api"
import { toast } from "sonner"
import type { ProductPassport } from "@/components/product-card"

interface LocalTransferModalProps {
  isOpen: boolean
  onClose: () => void
  passports: ProductPassport[]
}

type TransferState = "form" | "processing" | "complete"

interface TransferResult {
  passport: ProductPassport
  status: "pending" | "success" | "error"
  error?: string
}

export function LocalTransferModal({ isOpen, onClose, passports }: LocalTransferModalProps) {
  const [state, setState] = useState<TransferState>("form")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [results, setResults] = useState<TransferResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const { roleInfo } = useRole()

  // Available recipients: all roles except consumer and the current user
  const recipientOptions = Object.values(ROLES).filter(
    (role) => role.id !== "consumer" && role.address !== roleInfo.address
  )

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setState("form")
        setRecipientAddress("")
        setResults([])
        setCurrentIndex(0)
      }, 300)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setState("processing")

    const initialResults: TransferResult[] = passports.map((p) => ({
      passport: p,
      status: "pending" as const,
    }))
    setResults(initialResults)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < passports.length; i++) {
      setCurrentIndex(i)
      try {
        await transferDPP({
          dppId: passports[i].id,
          from: roleInfo.address,
          to: recipientAddress,
        })
        initialResults[i] = { ...initialResults[i], status: "success" }
        successCount++
      } catch (err: any) {
        initialResults[i] = { ...initialResults[i], status: "error", error: err.message }
        failCount++
      }
      setResults([...initialResults])
    }

    setState("complete")
    if (failCount === 0) {
      toast.success(`${successCount} DPP${successCount > 1 ? "s" : ""} transferred successfully!`)
    } else {
      toast.error(`${failCount} of ${passports.length} transfers failed.`)
    }
  }

  const selectedRecipient = recipientOptions.find((r) => r.address === recipientAddress)
  const successCount = results.filter((r) => r.status === "success").length
  const failCount = results.filter((r) => r.status === "error").length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={state === "form" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        {state === "form" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {state === "form" && (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Send className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-xl font-semibold">Transfer Ownership</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Transfer {passports.length} DPP{passports.length > 1 ? "s" : ""} to another wallet on the same network.
              </p>
            </div>

            {/* Assets Info */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border mb-5">
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

            {/* Form */}
            <form onSubmit={handleTransfer} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="recipient" className="flex items-center gap-2 text-sm">
                  <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                  Recipient
                </Label>
                <select
                  id="recipient"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a recipient...</option>
                  {recipientOptions.map((role) => (
                    <option key={role.id} value={role.address}>
                      {role.label} - {role.userName}
                    </option>
                  ))}
                </select>
                {selectedRecipient && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedRecipient.address}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!recipientAddress}
              >
                <Send className="w-4 h-4 mr-2" />
                Confirm Transfer{passports.length > 1 ? ` (${passports.length} DPPs)` : ""}
              </Button>
            </form>
          </>
        )}

        {state === "processing" && (
          <div className="py-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Processing Transfers</h3>
              <p className="text-sm text-muted-foreground">
                Transferring {currentIndex + 1} of {passports.length}...
              </p>
            </div>

            {/* Progress List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {results.map((r, i) => (
                <div
                  key={r.passport.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                    r.status === "success"
                      ? "bg-green-500/10 border border-green-500/20"
                      : r.status === "error"
                      ? "bg-red-500/10 border border-red-500/20"
                      : i === currentIndex
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-secondary/30 border border-border"
                  }`}
                >
                  <div className="shrink-0">
                    {r.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : r.status === "error" ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : i === currentIndex ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <Package className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="truncate flex-1">{r.passport.name}</span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">#{r.passport.tokenId}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === "complete" && (
          <div className="py-6 text-center animate-fade-in">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              failCount === 0 ? "bg-green-500/10" : "bg-yellow-500/10"
            }`}>
              {failCount === 0 ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {failCount === 0 ? "Transfer Complete" : "Transfer Finished"}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {successCount} of {passports.length} DPP{passports.length > 1 ? "s" : ""} transferred successfully.
            </p>

            {/* Results Summary */}
            {passports.length > 1 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto text-left my-4 px-1">
                {results.map((r) => (
                  <div
                    key={r.passport.id}
                    className={`flex items-center gap-2 p-2 rounded text-xs ${
                      r.status === "success"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {r.status === "success" ? (
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate flex-1">{r.passport.name}</span>
                    {r.error && <span className="text-red-400/70 shrink-0">Failed</span>}
                  </div>
                ))}
              </div>
            )}

            <Button onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  )
}
