"use client"

import { useState, useEffect } from "react"
import { 
  Layers, 
  PlusCircle, 
  Package,
  Check,
  X,
  Loader2,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getAllPassports, aggregateDPPtoBox } from "@/lib/api"
import { toast } from "sonner"
import { useRole } from "@/contexts/role-context"

interface SelectedProduct {
  id: string
  tokenId: string
  name: string
  ownerAddress?: string
}



export default function AggregatePage() {
  const { currentRole, roleInfo } = useRole()
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [lotName, setLotName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newBoxId, setNewBoxId] = useState("")
  const [availableProducts, setAvailableProducts] = useState<SelectedProduct[]>([])
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchPassports = async () => {
      setIsFetching(true)
      try {
        const livePassports = await getAllPassports()
        // Format to SelectedProduct, filtered by ownership (admin sees all)
        const formattedProducts = livePassports
          .filter((p: any) => {
            // Exclude burned/revoked DPPs (consumed by previous aggregation)
            if (p.status === "burned" || p.status === "revoked") return false
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

  const toggleProduct = (product: SelectedProduct) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) {
        return prev.filter((p) => p.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const handleAggregate = async () => {
    setIsLoading(true)
    try {
      const parentList = selectedProducts.map(p => p.id);
      const payload = {
         parentList: parentList,
         lotName: lotName.trim(),
         handler: roleInfo.userName,
         handlerAddress: roleInfo.address,
      };
      
      const response = await aggregateDPPtoBox(payload);
      
      setNewBoxId(response.newDPPBoxId || "Unknown Box ID");
      setIsSuccess(true);
      toast.success("Successfully aggregated passports into a Box!");

      // Refresh list in background (if user dismisses success screen)
      const livePassports = await getAllPassports()
      const formattedProducts = livePassports
        .filter((p: any) => {
          if (p.status === "burned" || p.status === "revoked") return false
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
    } catch (error: any) {
        toast.error(`Aggregation Failed: ${error.message}`);
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
        <h2 className="text-2xl font-bold mb-3">Lot Created Successfully!</h2>
        <p className="text-muted-foreground mb-6">
          Your aggregated lot "{lotName}" has been created on the ledger with {selectedProducts.length} products.
          <br/>
          <br/>
          <span className="font-mono bg-secondary px-2 py-1 rounded inline-block">New Box ID: {newBoxId}</span>
        </p>
        <Button onClick={() => {
          setIsSuccess(false)
          setSelectedProducts([])
          setLotName("")
        }}>
          Create Another Lot
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Aggregate Lots</h2>
        <p className="text-muted-foreground mt-1">
          Combine multiple Digital Product Passports into a single aggregated lot for bulk transfers.
        </p>
      </div>

      {/* Lot Configuration */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Lot Configuration
        </h3>

        <div className="space-y-2">
          <Label htmlFor="lotName">Lot Name</Label>
          <Input
            id="lotName"
            placeholder="e.g., Q1 2024 Shipment - North America"
            value={lotName}
            onChange={(e) => setLotName(e.target.value)}
            className="bg-secondary/50 border-border focus:border-primary"
          />
        </div>

        {/* Selected Products */}
        <div>
          <Label className="mb-3 block">Selected Products ({selectedProducts.length})</Label>
          {selectedProducts.length > 0 ? (
            <div className="space-y-2">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{product.tokenId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleProduct(product)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
              No products selected. Choose from available products below.
            </p>
          )}
        </div>
      </div>

      {/* Available Products */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-muted-foreground" />
          Available Products
        </h3>

        <div className="space-y-2">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
               <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
               <p className="text-sm">Fetching available passes from ledger...</p>
            </div>
          ) : availableProducts.length > 0 ? (
            availableProducts.map((product) => {
              const isSelected = selectedProducts.some((p) => p.id === product.id)
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? "bg-primary/10 border-primary/30"
                      : "bg-secondary/30 border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <Package className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{product.tokenId}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-primary text-primary-foreground" : "border border-border"
                  }`}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </button>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
              There are no available products to aggregate.
            </p>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 glass-card rounded-xl">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
          </p>
          {(selectedProducts.length < 2 || !lotName.trim()) && (
            <p className="text-xs text-muted-foreground">
              {selectedProducts.length < 2 && "Select at least 2 products"}
              {selectedProducts.length < 2 && !lotName.trim() && " and "}
              {!lotName.trim() && "enter a lot name"}
            </p>
          )}
        </div>
        <Button
          onClick={handleAggregate}
          disabled={selectedProducts.length < 2 || !lotName.trim() || isLoading}
          className={selectedProducts.length >= 2 && lotName.trim() ? "glow-primary" : ""}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Lot...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Aggregated Lot
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
