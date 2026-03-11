"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle,
  FileText,
  Calendar,
  Link as LinkIcon,
  Hash,
  Info
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createDPP } from "@/lib/api"
import { toast } from "sonner"
import { useRole } from "@/contexts/role-context"

interface MintFormData {
  productName: string
  productDescription: string
  creationDate: string
  origin: string
  productionMethod: string
  variety: string
  calibre: string
  brixDegree: string
  certifications: string
  manufacturer: string
}

export default function MintPage() {
  const router = useRouter()
  const { roleInfo, hasPermission } = useRole()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState<MintFormData>({
    productName: "",
    productDescription: "",
    creationDate: new Date().toISOString().split("T")[0],
    origin: "",
    productionMethod: "",
    variety: "",
    calibre: "",
    brixDegree: "",
    certifications: "",
    manufacturer: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const certsList = formData.certifications.split(',').map(c => c.trim()).filter(Boolean)

      // Build OpenSea-compatible attributes array
      const attributes: Array<Record<string, string | number>> = [
        { trait_type: "Variedade", value: formData.variety },
        { trait_type: "Calibre", value: formData.calibre },
        { trait_type: "Produtor", value: roleInfo.userName },
        { trait_type: "Método de Produção", value: formData.productionMethod },
        { display_type: "date", trait_type: "Data de Colheita", value: Math.floor(new Date(formData.creationDate).getTime() / 1000) },
      ]
      if (formData.brixDegree) {
        attributes.push({ trait_type: "Grau Brix", value: formData.brixDegree })
      }

      const generatedMetadataJSON = JSON.stringify({
        name: formData.productName,
        description: formData.productDescription,
        image: "ipfs://placeholder_image_cid",
        attributes,
        origin: formData.origin,
        productionMethod: formData.productionMethod,
        variety: formData.variety,
        calibre: formData.calibre,
        brixDegree: formData.brixDegree,
        certifications: certsList,
        manufacturer: roleInfo.userName,
        logistics: { storage_temp: "2°C - 4°C" },
        circular_economy: {
          packaging: [
            { material: "Cardboard Box", recyclability: "100% Recyclable", disposal: "Blue Bin (Paper/Cardboard)" },
            { material: "PET Protective Film", recyclability: "100% Recyclable", disposal: "Yellow Bin (Plastic)" },
          ],
          instructions: "Flatten the cardboard box to save space. Separate the plastic film before recycling.",
          return_scheme: "Return intact wooden baskets to participating Cerfundão partners for a €0.50 discount on your next purchase.",
        },
      });

      // Send real transaction to the Cacti Proxy Backend
      const response = await createDPP({
         owner: roleInfo.address,
         productionData: {
           name: formData.productName,
           description: formData.productDescription,
           createdAt: formData.creationDate,
           origin: formData.origin,
           productionMethod: formData.productionMethod,
           variety: formData.variety,
           calibre: formData.calibre,
           brixDegree: formData.brixDegree,
           certifications: certsList,
           manufacturer: roleInfo.userName,
           ipfsUri: generatedMetadataJSON,
         }
      })
      
      console.log("Success Mint Response:", response)
      setIsSuccess(true)
      toast.success(`Success! DPP created with internal ID: ${response.dppId}`)

      setTimeout(() => {
        router.push("/dashboard")
      }, 2500)

    } catch (e: any) {
        toast.error(`Mint Failed: ${e.message}`)
    } finally {
        setIsLoading(false)
    }
  }

  const handleChange = (field: keyof MintFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Passport Minted Successfully!</h2>
        <p className="text-muted-foreground mb-6">
          Your Digital Product Passport has been created and is now live on the blockchain.
        </p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  if (!hasPermission(["farmer"])) {
    return (
      <div className="max-w-md mx-auto py-24 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          Only registered farmers have permission to mint new original product passports.
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
        <h2 className="text-2xl font-bold tracking-tight">Mint New Digital Product Passport</h2>
        <p className="text-muted-foreground mt-1">
          Create an ERC-721 token representing your product with full supply chain metadata.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName" className="flex items-center gap-2 text-sm">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Product Name
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., Cereja do Fundão IGP - Lote #1024"
                  value={formData.productName}
                  onChange={handleChange("productName")}
                  required
                  className="bg-secondary/50 border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription" className="flex items-center gap-2 text-sm">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Description
                </Label>
                <Textarea
                  id="productDescription"
                  placeholder="e.g., Caixa de 2kg de Cerejas do Fundão autênticas, colhidas à mão na encosta da Serra da Gardunha."
                  value={formData.productDescription}
                  onChange={handleChange("productDescription")}
                  rows={3}
                  className="bg-secondary/50 border-border focus:border-primary resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="flex items-center gap-2 text-sm">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    Producer
                  </Label>
                  <Input
                    id="manufacturer"
                    placeholder="e.g., Quinta da Gardunha"
                    value={roleInfo.userName}
                    readOnly
                    disabled
                    className="bg-secondary/50 border-border opacity-70 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creationDate" className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Harvest Date
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
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Blockchain Metadata
            </h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin" className="flex items-center gap-2 text-sm">
                    <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    Origin
                  </Label>
                  <Input
                    id="origin"
                    placeholder="e.g., Fundão, Portugal"
                    value={formData.origin}
                    onChange={handleChange("origin")}
                    required
                    className="bg-secondary/50 border-border focus:border-primary text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productionMethod" className="flex items-center gap-2 text-sm">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    Production Method
                  </Label>
                  <Input
                    id="productionMethod"
                    placeholder="e.g., Produção Integrada"
                    value={formData.productionMethod}
                    onChange={handleChange("productionMethod")}
                    className="bg-secondary/50 border-border focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variety" className="flex items-center gap-2 text-sm">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    Variedade (Variety)
                  </Label>
                  <Input
                    id="variety"
                    placeholder="e.g., Saco, Burlat"
                    value={formData.variety}
                    onChange={handleChange("variety")}
                    className="bg-secondary/50 border-border focus:border-primary text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calibre" className="flex items-center gap-2 text-sm">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                    Calibre (Size)
                  </Label>
                  <Input
                    id="calibre"
                    placeholder="e.g., 30-32mm"
                    value={formData.calibre}
                    onChange={handleChange("calibre")}
                    className="bg-secondary/50 border-border focus:border-primary text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brixDegree" className="flex items-center gap-2 text-sm">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    Grau Brix
                  </Label>
                  <Input
                    id="brixDegree"
                    placeholder="e.g., 18%"
                    value={formData.brixDegree}
                    onChange={handleChange("brixDegree")}
                    className="bg-secondary/50 border-border focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications" className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  Certifications (comma separated)
                </Label>
                <Input
                  id="certifications"
                  placeholder="e.g., IGP (Indicação Geográfica Protegida), GlobalG.A.P."
                  value={formData.certifications}
                  onChange={handleChange("certifications")}
                  className="bg-secondary/50 border-border focus:border-primary text-sm"
                />
              </div>

              {/* Info Box */}
              <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Auto-generated IPFS Metadata</p>
                  <p>
                    These fields will be automatically formatted into a JSON metadata structure 
                    compliant with the ERC-721 standard before being pushed to the ledger.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border">
            <Button 
              type="submit" 
              size="lg"
              className="w-full glow-primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting Passport...
                </>
              ) : (
                "Mint Digital Product Passport"
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              This will create an ERC-721 token on the connected network.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
