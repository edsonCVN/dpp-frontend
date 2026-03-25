"use client"

import { useState, useEffect } from "react"
import {
  Split,
  Package,
  Loader2,
  CheckCircle,
  Minus,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getAllPassports, disaggregateDPP } from "@/lib/api"
import { toast } from "sonner"
import { useRole } from "@/contexts/role-context"

interface SelectableProduct {
  id: string
  tokenId: string
  name: string
  ownerAddress?: string
}

export default function DisaggregatePage() {
  const { currentRole, roleInfo } = useRole()
  const [selectedProduct, setSelectedProduct] = useState<SelectableProduct | null>(null)
  const [count, setCount] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newTokenIds, setNewTokenIds] = useState<string[]>([])
  const [availableProducts, setAvailableProducts] = useState<SelectableProduct[]>([])
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchPassports = async () => {
      setIsFetching(true)
      try {
        const livePassports = await getAllPassports()
        const formattedProducts = livePassports
          .filter((p: any) => {
            if (p.status === "revoked") return false
            if (currentRole === "admin") return true
            return p.ownerAddress?.toLowerCase() === roleInfo.address.toLowerCase()
          })
          .map((p: any) => ({
            id: p.id,
            tokenId: p.tokenId,
            name: p.name || `Product ${p.tokenId}`,
            ownerAddress: p.ownerAddress,
          }))
        setAvailableProducts(formattedProducts)
      } catch (err: any) {
        toast.error(`Could not fetch available products: ${err.message}`)
      } finally {
        setIsFetching(false)
      }
    }
    fetchPassports()
  }, [])

  const handleDisaggregate = async () => {
    if (!selectedProduct) return
    setIsLoading(true)
    try {
      const payload = {
        dppId: selectedProduct.id,
        count,
        handler: roleInfo.userName,
        handlerAddress: roleInfo.address,
      }

      const response = await disaggregateDPP(payload)

      setNewTokenIds(response.newTokenIds || [])
      setIsSuccess(true)
      toast.success(`Successfully split DPP into ${count} new passports!`)
    } catch (error: any) {
      toast.error(`Disaggregation failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Disaggregation Successful!</h2>
        <p className="text-muted-foreground mb-4">
          DPP &quot;{selectedProduct?.name}&quot; was split into {newTokenIds.length} new independent passports.
          The original has been revoked.
        </p>
        <div className="space-y-2 mb-6">
          {newTokenIds.map((id) => (
            <div key={id} className="font-mono bg-secondary px-3 py-1.5 rounded inline-block mx-1">
              Token #{id}
            </div>
          ))}
        </div>
        <Button onClick={() => {
          setIsSuccess(false)
          setSelectedProduct(null)
          setCount(2)
          setNewTokenIds([])
          // Refresh products list
          getAllPassports().then((livePassports) => {
            setAvailableProducts(
              livePassports
                .filter((p: any) => {
                  if (p.status === "revoked") return false
                  if (currentRole === "admin") return true
                  return p.ownerAddress?.toLowerCase() === roleInfo.address.toLowerCase()
                })
                .map((p: any) => ({
                  id: p.id,
                  tokenId: p.tokenId,
                  name: p.name || `Product ${p.tokenId}`,
                  ownerAddress: p.ownerAddress,
                }))
            )
          }).catch(() => {})
        }}>
          Disaggregate Another
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Disaggregate DPP</h2>
        <p className="text-muted-foreground mt-1">
          Split a Digital Product Passport into multiple independent copies.
          Each new DPP inherits the original&apos;s metadata and certifications. The original is revoked.
        </p>
      </div>

      {/* Configuration */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Split className="w-5 h-5 text-primary" />
          Split Configuration
        </h3>

        {/* Count selector */}
        <div className="space-y-2">
          <Label>Number of new DPPs</Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount(Math.max(2, count - 1))}
              disabled={count <= 2}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-3xl font-bold w-12 text-center">{count}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount(Math.min(20, count + 1))}
              disabled={count >= 20}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Between 2 and 20 new passports can be created from a single DPP.
          </p>
        </div>

        {/* Selected Product */}
        {selectedProduct && (
          <div>
            <Label className="mb-3 block">Selected DPP</Label>
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedProduct.tokenId}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProduct(null)}
                className="text-muted-foreground hover:text-destructive"
              >
                Change
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Available Products */}
      {!selectedProduct && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            Select a DPP to Split
          </h3>

          <div className="space-y-2">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm">Fetching available passes from ledger...</p>
              </div>
            ) : availableProducts.length > 0 ? (
              availableProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="w-full flex items-center justify-between p-4 rounded-lg border bg-secondary/30 border-border hover:border-primary/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{product.tokenId}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                There are no available products to disaggregate.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 glass-card rounded-xl">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {selectedProduct
              ? `Split "${selectedProduct.name}" into ${count} new DPPs`
              : "Select a DPP to split"}
          </p>
          {!selectedProduct && (
            <p className="text-xs text-muted-foreground">
              Choose a product from the list above
            </p>
          )}
        </div>
        <Button
          onClick={handleDisaggregate}
          disabled={!selectedProduct || isLoading}
          className={selectedProduct ? "glow-primary" : ""}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Splitting DPP...
            </>
          ) : (
            <>
              <Split className="w-4 h-4 mr-2" />
              Disaggregate DPP
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
