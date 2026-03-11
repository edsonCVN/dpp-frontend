"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRightLeft,
  Send,
  Info,
  RefreshCw,
  Package,
  Check,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAllPassports } from "@/lib/api"
import { toast } from "sonner"
import { useRole } from "@/contexts/role-context"
import type { ProductPassport } from "@/components/product-card"
import { LocalTransferModal } from "@/components/local-transfer-modal"
import { TransferModal } from "@/components/transfer-modal"

export default function TransferPage() {
  const router = useRouter()
  const { currentRole, roleInfo, hasPermission } = useRole()
  const [passports, setPassports] = useState<ProductPassport[]>([])
  const [isLoadingPassports, setIsLoadingPassports] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showLocalTransfer, setShowLocalTransfer] = useState(false)
  const [showCrossChainTransfer, setShowCrossChainTransfer] = useState(false)

  useEffect(() => {
    const fetchPassports = async () => {
      try {
        const data = await getAllPassports()
        setPassports(data || [])
      } catch (e: any) {
        toast.error(`Could not load passports: ${e.message}`)
      } finally {
        setIsLoadingPassports(false)
      }
    }
    fetchPassports()
  }, [])

  // Only show DPPs the current user owns (admin sees all)
  const ownedPassports = passports.filter((passport) => {
    if (currentRole === "admin") return true
    return passport.ownerAddress?.toLowerCase() === roleInfo.address.toLowerCase()
  })

  const selectedPassports = ownedPassports.filter((p) => selectedIds.has(p.id))

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === ownedPassports.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(ownedPassports.map((p) => p.id)))
    }
  }

  const handleOpenLocal = () => {
    if (selectedPassports.length === 0) {
      toast.error("Please select at least one passport.")
      return
    }
    setShowLocalTransfer(true)
  }

  const handleOpenCrossChain = () => {
    if (selectedPassports.length === 0) {
      toast.error("Please select at least one passport.")
      return
    }
    setShowCrossChainTransfer(true)
  }

  if (!hasPermission(["farmer", "processor", "transporter", "retailer", "admin"])) {
    return (
      <div className="max-w-md mx-auto py-24 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          Consumers do not have permission to transfer Digital Product Passports.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Transfer Digital Product Passports</h2>
        <p className="text-muted-foreground mt-1">
          Select one or more DPPs to transfer locally or across chains via the SATP gateway.
        </p>
      </div>

      {/* Step 1: Select Passports */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            1. Select Passports
          </h3>
          {selectedPassports.length > 0 && (
            <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {selectedPassports.length} selected
            </span>
          )}
        </div>

        {isLoadingPassports ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading passports...
          </div>
        ) : ownedPassports.length > 0 ? (
          <div className="space-y-2">
            {/* Select All */}
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-secondary/20 border border-border hover:bg-secondary/40 transition-colors text-sm text-muted-foreground"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                selectedIds.size === ownedPassports.length
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/40"
              }`}>
                {selectedIds.size === ownedPassports.length && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              Select All ({ownedPassports.length})
            </button>

            {/* Passport List */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {ownedPassports.map((p) => {
                const isSelected = selectedIds.has(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleSelection(p.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/50 border-border hover:border-foreground/20"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/40"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">Token #{p.tokenId}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground">
            No passports available. You can only transfer DPPs you own.
          </div>
        )}
      </div>

      {/* Step 2: Choose Transfer Type */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          2. Choose Transfer Type
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Local Transfer */}
          <div className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-foreground/20 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Local Transfer</h4>
                <p className="text-xs text-muted-foreground">Same network</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Transfer the selected DPP{selectedPassports.length !== 1 ? "s" : ""} to another wallet address on the same blockchain network.
            </p>
            <Button
              onClick={handleOpenLocal}
              variant="outline"
              className="w-full border-border"
              disabled={selectedPassports.length === 0}
            >
              <Send className="w-4 h-4 mr-2" />
              Local Transfer{selectedPassports.length > 1 ? ` (${selectedPassports.length})` : ""}
            </Button>
          </div>

          {/* Cross-Chain Transfer */}
          <div className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-foreground/20 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Cross-Chain Transfer</h4>
                <p className="text-xs text-muted-foreground">Via SATP Gateway</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Transfer the selected DPP{selectedPassports.length !== 1 ? "s" : ""} to a different blockchain network using the SATP Hermes gateway protocol.
            </p>
            <Button
              onClick={handleOpenCrossChain}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={selectedPassports.length === 0}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Cross-Chain{selectedPassports.length > 1 ? ` (${selectedPassports.length})` : ""}
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 mt-6">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Which transfer type should I use?</p>
            <p>
              Use <strong>Local Transfer</strong> to move ownership within the same network (e.g., farmer to processor).
              Use <strong>Cross-Chain Transfer</strong> to move the asset to a different blockchain via the SATP protocol.
              You can select multiple passports to transfer them all at once.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LocalTransferModal
        isOpen={showLocalTransfer}
        onClose={() => setShowLocalTransfer(false)}
        passports={selectedPassports}
      />
      <TransferModal
        isOpen={showCrossChainTransfer}
        onClose={() => setShowCrossChainTransfer(false)}
        passports={selectedPassports}
      />
    </div>
  )
}
