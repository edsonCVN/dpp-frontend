"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Layers,
  FileEdit,
  Award,
  Thermometer,
  MapPin,
  Clock,
  PackageCheck,
  Calendar,
  MessageSquare,
  Loader2,
  Check,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRole, type UserRole, ROLES } from "@/contexts/role-context"
import { cn } from "@/lib/utils"
import { submitProductReview, updateTransportData, markAsReceived, updateRetailData, amendDPPData, addCertification } from "@/lib/api"


interface ActionPanelProps {
  onAction?: () => void
  productStage?: string
  dppId?: string
  productData?: {
    origin?: string
    productionMethod?: string
    description?: string
    manufacturer?: string
    variety?: string
    calibre?: string
    brixDegree?: string
  }
}

// Shared Amend Metadata + Add Certification section
function AmendAndCertifySection({ dppId, productData, onAction }: ActionPanelProps) {
  const { roleInfo } = useRole()
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAmendForm, setShowAmendForm] = useState(false)
  const [showCertForm, setShowCertForm] = useState(false)
  const [amendFields, setAmendFields] = useState({
    origin: productData?.origin || "",
    productionMethod: productData?.productionMethod || "",
    description: productData?.description || "",
    manufacturer: productData?.manufacturer || "",
    variety: productData?.variety || "",
    calibre: productData?.calibre || "",
    brixDegree: productData?.brixDegree || "",
  })

  const handleAmend = async () => {
    setActiveAction("amend")
    setIsLoading(true)
    try {
      await amendDPPData({
        dppId: dppId || "0",
        newData: amendFields,
        handlerAddress: roleInfo.address,
      })
      setShowAmendForm(false)
      onAction?.()
    } catch (e: any) {
      console.error(e)
      alert(`Failed to amend metadata: ${e.message}`)
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  const handleCertify = async () => {
    setActiveAction("certify")
    setIsLoading(true)
    try {
      const certId = (document.getElementById("sharedCertId") as HTMLInputElement)?.value || ""
      await addCertification({
        dppId: dppId || "0",
        certificationData: { certId, issuedBy: roleInfo.userName, date: new Date().toISOString() },
        handlerAddress: roleInfo.address,
      })
      setShowCertForm(false)
      onAction?.()
    } catch (e: any) {
      console.error(e)
      alert(`Failed to add certification: ${e.message}`)
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  return (
    <>
      {/* Amend Metadata */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-foreground/10 flex items-center justify-center">
            <FileEdit className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Amend Metadata</h4>
            <p className="text-xs text-muted-foreground">Update product information</p>
          </div>
        </div>
        {!showAmendForm ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAmendForm(true)}
            className="w-full"
          >
            <FileEdit className="w-4 h-4 mr-2" />
            Amend Metadata
          </Button>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="amendOrigin" className="text-xs">Origin</Label>
              <Input
                id="amendOrigin"
                value={amendFields.origin}
                onChange={(e) => setAmendFields({ ...amendFields, origin: e.target.value })}
                placeholder="e.g., Fundão, Portugal"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amendMethod" className="text-xs">Production Method</Label>
              <Input
                id="amendMethod"
                value={amendFields.productionMethod}
                onChange={(e) => setAmendFields({ ...amendFields, productionMethod: e.target.value })}
                placeholder="e.g., Organic farming"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amendManufacturer" className="text-xs">Producer</Label>
              <Input
                id="amendManufacturer"
                value={amendFields.manufacturer}
                onChange={(e) => setAmendFields({ ...amendFields, manufacturer: e.target.value })}
                placeholder="e.g., Quinta da Gardunha"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="amendVariety" className="text-xs">Variedade</Label>
                <Input
                  id="amendVariety"
                  value={amendFields.variety}
                  onChange={(e) => setAmendFields({ ...amendFields, variety: e.target.value })}
                  placeholder="e.g., Saco"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amendCalibre" className="text-xs">Calibre</Label>
                <Input
                  id="amendCalibre"
                  value={amendFields.calibre}
                  onChange={(e) => setAmendFields({ ...amendFields, calibre: e.target.value })}
                  placeholder="e.g., 30-32mm"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amendBrix" className="text-xs">Grau Brix</Label>
                <Input
                  id="amendBrix"
                  value={amendFields.brixDegree}
                  onChange={(e) => setAmendFields({ ...amendFields, brixDegree: e.target.value })}
                  placeholder="e.g., 18%"
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amendDescription" className="text-xs">Description</Label>
              <Textarea
                id="amendDescription"
                value={amendFields.description}
                onChange={(e) => setAmendFields({ ...amendFields, description: e.target.value })}
                placeholder="Product description..."
                className="min-h-[60px] text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAmendForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAmend}
                disabled={isLoading && activeAction === "amend"}
                className="flex-1"
              >
                {isLoading && activeAction === "amend" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileEdit className="w-4 h-4 mr-2" />
                )}
                Submit
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Certification */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-foreground/10 flex items-center justify-center">
            <Award className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Add Certification</h4>
            <p className="text-xs text-muted-foreground">Attach quality certification</p>
          </div>
        </div>
        {!showCertForm ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCertForm(true)}
            className="w-full"
          >
            <Award className="w-4 h-4 mr-2" />
            Add Certification
          </Button>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="sharedCertId" className="text-xs">Certification ID</Label>
              <Input id="sharedCertId" placeholder="e.g., GlobalG.A.P., FairTrade, ISO-22000" className="text-sm" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCertForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCertify}
                disabled={isLoading && activeAction === "certify"}
                className="flex-1"
              >
                {isLoading && activeAction === "certify" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Award className="w-4 h-4 mr-2" />
                )}
                Submit
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Consumer Panel - Read Only with Review option
export function ConsumerPanel({ productStage, dppId }: ActionPanelProps) {
  const { roleInfo } = useRole()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitReview = async () => {
    try {
      await submitProductReview({
        dppId: dppId || "0",
        rating,
        comment: "User submitted a review",
        reviewer: roleInfo.userName,
        reviewerAddress: roleInfo.address
      });
      setSubmitted(true)
      setTimeout(() => {
        setReviewOpen(false)
        setSubmitted(false)
        setRating(0)
      }, 2000)
    } catch (e) {
      console.error(e);
      alert("Failed to submit review via Cacti API");
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Public Access</h4>
            <p className="text-xs text-muted-foreground">Read-only view of product data</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          You can view the complete provenance history, certifications, and product details. 
          No modifications are allowed with consumer access.
        </p>
      </div>

      {productStage === "retail" && (
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <h4 className="font-semibold text-sm mb-3">Product Review</h4>
          {!reviewOpen ? (
            <Button variant="outline" onClick={() => setReviewOpen(true)} className="w-full">
              <Star className="w-4 h-4 mr-2" />
              Submit a Review
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={cn(
                      "p-1 transition-colors",
                      star <= rating ? "text-yellow-400" : "text-muted-foreground/30"
                    )}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
              <Textarea placeholder="Share your experience..." className="min-h-[80px]" />
              <Button onClick={handleSubmitReview} disabled={rating === 0 || submitted} className="w-full">
                {submitted ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Review Submitted
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Farmer Panel - Amend/Certify (Mint is done via the dedicated /dashboard/mint page)
export function FarmerPanel({ onAction, dppId, productData }: ActionPanelProps) {
  return (
    <AmendAndCertifySection dppId={dppId} productData={productData} onAction={onAction} />
  )
}

// Processor Panel - Aggregate, Amend, Certify
export function ProcessorPanel({ onAction, dppId, productData }: ActionPanelProps) {
  return (
    <div className="space-y-4">
      {/* Aggregate */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Aggregate into Box/Lot</h4>
            <p className="text-xs text-muted-foreground">Combine multiple DPPs</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full border-amber-500/30 hover:bg-amber-500/10"
        >
          <Link href="/dashboard/aggregate">
            <Layers className="w-4 h-4 mr-2" />
            Aggregate Products
          </Link>
        </Button>
      </div>

      <AmendAndCertifySection dppId={dppId} productData={productData} onAction={onAction} />
    </div>
  )
}

// Transporter Panel - Log Telemetry
export function TransporterPanel({ onAction, dppId }: ActionPanelProps) {
  const { roleInfo } = useRole()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleLog = async () => {
    setIsLoading(true)
    try {
      await updateTransportData({
        dppId: dppId || "0",
        transportData: {
          location: (document.getElementById("location") as HTMLInputElement)?.value || "Unknown",
          timestamp: (document.getElementById("timestamp") as HTMLInputElement)?.value || new Date().toISOString(),
          conditionData: "Optimal",
          handler: roleInfo.userName,
          handlerAddress: roleInfo.address
        }
      });
      setIsLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onAction?.()
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      alert("Failed to Log Telemetry via Cacti API");
    }
  }

  return (
    <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Thermometer className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h4 className="font-semibold">Log Telemetry Data</h4>
          <p className="text-xs text-muted-foreground">Record transport conditions</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Current Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="location" placeholder="e.g., Lisbon Port, Portugal" className="pl-9" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="timestamp">Timestamp</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="timestamp" type="datetime-local" className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <div className="relative">
              <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="temperature" type="number" placeholder="4.5" className="pl-9" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition Notes</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="optimal">Optimal</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="acceptable">Acceptable</SelectItem>
              <SelectItem value="concern">Concern - Needs Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleLog} 
          disabled={isLoading || success}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Recording Data...
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Telemetry Logged!
            </>
          ) : (
            <>
              <Thermometer className="w-4 h-4 mr-2" />
              Log Telemetry Data
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Retailer Panel - Receive, Update, Amend, Certify
export function RetailerPanel({ onAction, dppId, productData }: ActionPanelProps) {
  const { roleInfo } = useRole()
  const [isLoading, setIsLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const handleAction = async (action: string) => {
    setActiveAction(action)
    setIsLoading(true)
    try {
      if (action === "receive") {
        await markAsReceived({ 
          dppId: dppId || "0",
          handler: roleInfo.userName,
          handlerAddress: roleInfo.address
        });
      } else if (action === "shelf") {
        await updateRetailData({ 
          dppId: dppId || "0",
          shelfLife: (document.getElementById("shelfLife") as HTMLInputElement)?.value || "2025-12-31",
          handler: roleInfo.userName,
          handlerAddress: roleInfo.address
        });
      }
      setIsLoading(false)
      setActiveAction(null)
      onAction?.()
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      alert("Failed to update Retail status via Cacti API");
    }
  }

  return (
    <div className="space-y-4">
      {/* Mark Received */}
      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <PackageCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Mark as Received</h4>
            <p className="text-xs text-muted-foreground">Confirm product arrival at store</p>
          </div>
        </div>
        <Button 
          onClick={() => handleAction("receive")}
          disabled={isLoading && activeAction === "receive"}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading && activeAction === "receive" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <PackageCheck className="w-4 h-4 mr-2" />
          )}
          Mark as Received
        </Button>
      </div>

      {/* Update Shelf Life */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-foreground/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Update Retail Data</h4>
            <p className="text-xs text-muted-foreground">Set shelf life and pricing</p>
          </div>
        </div>
        <div className="space-y-3 mb-3">
          <div className="space-y-1.5">
            <Label htmlFor="shelfLife" className="text-xs">Shelf Life Expiry</Label>
            <Input id="shelfLife" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs">Retail Price</Label>
            <Input id="price" type="number" placeholder="9.99" />
          </div>
        </div>
        <Button 
          variant="secondary"
          onClick={() => handleAction("shelf")}
          disabled={isLoading && activeAction === "shelf"}
          className="w-full"
        >
          {isLoading && activeAction === "shelf" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Calendar className="w-4 h-4 mr-2" />
          )}
          Update Retail Data
        </Button>
      </div>

      <AmendAndCertifySection dppId={dppId} productData={productData} onAction={onAction} />
    </div>
  )
}

// Admin Panel - Amend/Certify
export function AdminPanel({ dppId, onAction, productData }: { dppId?: string, onAction?: () => void, productData?: ActionPanelProps["productData"] }) {
  return (
    <AmendAndCertifySection dppId={dppId} productData={productData} onAction={onAction} />
  )
}
