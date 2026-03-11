"use client"

import { useState } from "react"
import { 
  X, 
  Loader2, 
  CheckCircle,
  FileText,
  Calendar,
  Link as LinkIcon,
  Hash
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MintModalProps {
  isOpen: boolean
  onClose: () => void
  onMint: (data: MintFormData) => Promise<void>
}

export interface MintFormData {
  productId: string
  productName: string
  creationDate: string
  ipfsUri: string
}

export function MintModal({ isOpen, onClose, onMint }: MintModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState<MintFormData>({
    productId: "",
    productName: "",
    creationDate: new Date().toISOString().split("T")[0],
    ipfsUri: "",
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onMint(formData)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
        setFormData({
          productId: "",
          productName: "",
          creationDate: new Date().toISOString().split("T")[0],
          ipfsUri: "",
        })
      }, 2000)
    } catch (error) {
      console.error("Minting failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof MintFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Passport Minted!</h3>
            <p className="text-sm text-muted-foreground">
              Your Digital Product Passport has been successfully created.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Mint New Digital Product Passport</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Create an ERC-721 token representing your product.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId" className="flex items-center gap-2 text-sm">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  Product ID
                </Label>
                <Input
                  id="productId"
                  placeholder="e.g., PROD-001"
                  value={formData.productId}
                  onChange={handleChange("productId")}
                  required
                  className="bg-secondary/50 border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productName" className="flex items-center gap-2 text-sm">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Product Name
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., Organic Coffee Beans - Batch A"
                  value={formData.productName}
                  onChange={handleChange("productName")}
                  required
                  className="bg-secondary/50 border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creationDate" className="flex items-center gap-2 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Creation Date
                </Label>
                <Input
                  id="creationDate"
                  type="date"
                  value={formData.creationDate}
                  onChange={handleChange("creationDate")}
                  required
                  className="bg-secondary/50 border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipfsUri" className="flex items-center gap-2 text-sm">
                  <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  IPFS Metadata URI
                </Label>
                <Input
                  id="ipfsUri"
                  placeholder="ipfs://Qm..."
                  value={formData.ipfsUri}
                  onChange={handleChange("ipfsUri")}
                  required
                  className="bg-secondary/50 border-border focus:border-primary font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The IPFS URI containing your product metadata JSON.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6 glow-primary" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting Passport...
                  </>
                ) : (
                  "Mint Passport"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
