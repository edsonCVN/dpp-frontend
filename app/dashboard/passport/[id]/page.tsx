"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Package,
  Calendar,
  Network,
  FileText,
  Building,
  Hash,
  Sparkles,
  Shield,
  Loader2,
  User,
  Clock,
  Euro
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SupplyChainTimeline, type TimelineEvent } from "@/components/supply-chain-timeline"
import { PackagingRecycling } from "@/components/packaging-recycling"
import { useRole, ROLES } from "@/contexts/role-context"
import { fetchDPPData, fetchDPPHistory, fetchConfig } from "@/lib/api"
import { ipfsToHttp } from "@/lib/ipfs"
import { toast } from "sonner"
import {
  ConsumerPanel,
  FarmerPanel,
  ProcessorPanel,
  TransporterPanel,
  RetailerPanel,
  AdminPanel,
} from "@/components/role-action-panels"
import type { ProductStatus } from "@/components/product-card"

// Map event keys (stored on-chain) to human-readable labels and timeline types
const EVENT_LABELS: Record<string, { title: string; type: TimelineEvent["type"] }> = {
  Mint:           { title: "Harvest Registered",              type: "created" },
  Transfer:       { title: "Ownership Transferred",           type: "transfer" },
  Aggregate:      { title: "Processing & Packing",            type: "aggregated" },
  Disaggregate:   { title: "Split into Multiple DPPs",         type: "aggregated" },
  Disaggregated:  { title: "Disaggregated (Original Revoked)",  type: "inspection" },
  Transport:      { title: "Shipped (Cold Chain)",             type: "shipped" },
  Received:       { title: "Marked as Available",               type: "received" },
  Retail:         { title: "Retail Data Updated",              type: "retail" },
  Amend:          { title: "Metadata Amended",                 type: "inspection" },
  Certification:  { title: "Quality Control Passed",           type: "certification" },
  Revoke:         { title: "Passport Revoked",                 type: "inspection" },
  Lock:           { title: "Locked for Cross-Chain",           type: "transfer" },
  Unlock:         { title: "Unlocked (Rollback)",              type: "transfer" },
  CrossChainBurn: { title: "Burned for Cross-Chain",           type: "transfer" },
  CrossChainMint: { title: "Minted via Cross-Chain",           type: "created" },
}

// Resolve an on-chain address to a known actor name
function resolveActor(address: string): string {
  if (!address) return "Unknown"
  const normalized = address.toLowerCase()
  const found = Object.values(ROLES).find(r => r.address.toLowerCase() === normalized)
  return found ? found.userName : `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Build a context-rich description and location from enriched history data
function buildEventDetails(item: any, actorName: string): { description: string; location: string } {
  const event = item.event || ""

  switch (event) {
    case "Mint":
      return {
        description: `Origin passport created by ${actorName}`,
        location: "Origin Farm",
      }
    case "Transport":
      if (item.locationFrom && item.locationTo) {
        const cond = item.conditionData && item.conditionData !== "{}" ? ` — ${item.conditionData}` : ""
        return {
          description: `Shipped from ${item.locationFrom} to ${item.locationTo}${cond}`,
          location: `${item.locationFrom} → ${item.locationTo}`,
        }
      }
      return { description: `Shipped by ${actorName}`, location: "In Transit" }
    case "Certification": {
      const cert = item.certification
      const certLabel = typeof cert === "string"
        ? cert
        : cert?.certId || cert?.name || JSON.stringify(cert)
      return {
        description: `Certification added: ${certLabel}`,
        location: "On-chain",
      }
    }
    case "Received":
      return {
        description: `Marked as available by ${actorName}`,
        location: "Retail Store",
      }
    case "Retail":
      return {
        description: `Retail data updated by ${actorName}`,
        location: "Retail Store",
      }
    case "Aggregate":
      return {
        description: `Products aggregated into lot by ${actorName}`,
        location: "Processing Facility",
      }
    case "Disaggregate":
      return {
        description: `New DPP created from disaggregation by ${actorName}`,
        location: "Processing Facility",
      }
    case "Disaggregated":
      return {
        description: `DPP split into multiple copies by ${actorName} — original revoked`,
        location: "Processing Facility",
      }
    case "Amend":
      return {
        description: `Metadata amended by ${actorName}`,
        location: "On-chain",
      }
    case "Transfer":
      return {
        description: `Ownership transferred by ${actorName}`,
        location: "On-chain",
      }
    case "Lock":
    case "SATPLock":
      return {
        description: `Asset locked in escrow for cross-chain transfer`,
        location: "Source Chain",
      }
    case "CrossChainBurn":
      return {
        description: `Asset burned on source chain (SATP Phase 3)`,
        location: "Source Chain",
      }
    case "CrossChainMint":
      return {
        description: `Asset minted on destination chain via SATP`,
        location: "Destination Chain",
      }
    case "Revoke":
      return {
        description: `Passport revoked by ${actorName}`,
        location: "On-chain",
      }
    default:
      return {
        description: `On-chain • ${actorName}`,
        location: "On-chain",
      }
  }
}

const statusConfig: Record<ProductStatus, { label: string; className: string }> = {
  created: {
    label: "Active Passport",
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  "in-transit": {
    label: "In Transit",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  received: {
    label: "Available",
    className: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  },
  locked: {
    label: "Locked",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  "locked-crosschain": {
    label: "Escrowed Out",
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  retail: {
    label: "Retail Ready",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  revoked: {
    label: "Revoked",
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  }
}

export default function PassportDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const [copied, setCopied] = useState<string | null>(null)
  const { currentRole, roleInfo } = useRole()

  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

  const loadData = React.useCallback(async () => {
    try {
      const [data, historyData, configData] = await Promise.allSettled([
        fetchDPPData(productId),
        fetchDPPHistory(productId),
        fetchConfig(),
      ])

      if (data.status === "fulfilled" && data.value?.dppData) {
        const dpp = data.value.dppData
        let parsedDate = "Unknown Date";
        try {
          parsedDate = new Date(dpp.creationDate).toISOString().split('T')[0];
        } catch(e) {
          parsedDate = dpp.creationDate;
        }

        let ipfsData = dpp.publicData;
        if (typeof ipfsData === 'object' && ipfsData !== null) {
            ipfsData = JSON.stringify(ipfsData);
        }

        setProduct({
          id: dpp.dppId,
          tokenId: `DPP-${String(dpp.dppId).padStart(4, '0')}`,
          name: dpp.productName !== "Unknown Product" ? dpp.productName : (dpp.publicData?.name || dpp.productId),
          description: dpp.publicData?.description || "No product description written yet.",
          createdAt: parsedDate,
          status: dpp.status.toLowerCase().replace("_", "-"),
          ipfsUri: ipfsData,
          manufacturer: dpp.publicData?.manufacturer || dpp.owner || "Unknown",
          contractAddress: configData.status === "fulfilled" ? configData.value.contractAddress : "N/A",
          origin: dpp.publicData?.origin || "N/A",
          certifications: [
            ...(dpp.publicData?.certifications || []),
            ...(dpp.certifications || []),
          ],
          productionMethod: dpp.publicData?.productionMethod || "N/A",
          variety: dpp.publicData?.variety || "N/A",
          calibre: dpp.publicData?.calibre || "N/A",
          brixDegree: dpp.publicData?.brixDegree || "N/A",
          attributes: dpp.publicData?.attributes || [],
          logistics: dpp.publicData?.logistics || {},
          circular_economy: dpp.publicData?.circular_economy || null,
          ownerAddress: dpp.owner || "Unknown",
          shelfLife: dpp.publicData?.shelfLife || null,
          price: dpp.publicData?.price || null,
          image: dpp.publicData?.image || "",
          metadataCid: dpp.publicData?.metadataCid || dpp.metadataCid || "",
        })
      } else if (data.status === "rejected") {
        toast.error(`Failed to load DPP: ${data.reason?.message}`)
      }

      if (historyData.status === "fulfilled") {
        const rawHistory = Array.isArray(historyData.value)
          ? historyData.value
          : Array.isArray(historyData.value?.history)
            ? historyData.value.history
            : []
        const events: TimelineEvent[] = rawHistory.map((item: any, i: number) => {
          let parsed: { event?: string; actor?: string; timestamp?: number } = {}
          if (typeof item === "string") {
            try { parsed = JSON.parse(item) } catch { parsed = { event: item } }
          } else {
            parsed = item
          }

          const eventKey = parsed.event || item.action || ""
          const label = EVENT_LABELS[eventKey]
          const actorName = parsed.actor
            ? resolveActor(parsed.actor)
            : (item.actor || item.handler || "Unknown Actor")

          const ts = parsed.timestamp
            ? new Date(parsed.timestamp * 1000).toLocaleString()
            : item.timestamp
              ? new Date(item.timestamp).toLocaleString()
              : "Unknown"

          const details = buildEventDetails(parsed, actorName)

          return {
            id: String(i),
            type: label?.type || "inspection",
            title: label?.title || eventKey || `Event #${i + 1}`,
            description: details.description,
            location: details.location,
            timestamp: ts,
            actor: actorName,
            txHash: item.txHash || item.transactionHash || "",
          }
        })
        setTimelineEvents(events)
      }
    } catch (err: any) {
      toast.error(`Failed to load DPP page: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Fetching product passport from blockchain...
          </p>
        </div>
      </div>
    )
  }

  if (!product) return <div>No product found.</div>

  const statusInfo = statusConfig[product.status as ProductStatus] || { label: product.status, className: "bg-gray-500/10 text-gray-500" }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Link */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          {ipfsToHttp(product.image) ? (
            <img
              src={ipfsToHttp(product.image)}
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Package className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
              <Badge variant="outline" className={cn("text-xs font-medium", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{product.tokenId}</p>
          </div>
        </div>

        
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Product Details Card */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Product Details
            </h3>

            <div className="space-y-3">
              <DetailItem
                icon={<Hash className="w-4 h-4" />}
                label="Token ID"
                value={product.tokenId}
                monospace
              />
              <DetailItem
                icon={<Package className="w-4 h-4" />}
                label="Origin"
                value={product.origin}
              />
              <DetailItem
                icon={<FileText className="w-4 h-4" />}
                label="Production Method"
                value={product.productionMethod}
              />
              <DetailItem
                icon={<Sparkles className="w-4 h-4" />}
                label="Variedade"
                value={product.variety}
              />
              <DetailItem
                icon={<Hash className="w-4 h-4" />}
                label="Calibre"
                value={product.calibre}
              />
              {product.brixDegree && product.brixDegree !== "N/A" && (
                <DetailItem
                  icon={<FileText className="w-4 h-4" />}
                  label="Grau Brix"
                  value={product.brixDegree}
                />
              )}
              <DetailItem
                icon={<Building className="w-4 h-4" />}
                label="Producer"
                value={product.manufacturer}
              />
              <DetailItem
                icon={<Calendar className="w-4 h-4" />}
                label="Harvest Date"
                value={product.createdAt}
              />
              <DetailItem
                icon={<User className="w-4 h-4" />}
                label="Current Owner"
                value={resolveActor(product.ownerAddress)}
              />
              {product.shelfLife && (
                <DetailItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Shelf Life Expiry"
                  value={product.shelfLife}
                />
              )}
              {product.price && (
                <DetailItem
                  icon={<Euro className="w-4 h-4" />}
                  label="Retail Price"
                  value={`€${product.price}`}
                />
              )}
            </div>
          </div>

          {/* Blockchain Details Card */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Blockchain Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Contract Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-foreground">{product.contractAddress}</code>
                  <button 
                    onClick={() => copyToClipboard(product.contractAddress, "contract")}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === "contract" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>


              {product.metadataCid && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Metadata (IPFS)</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-primary truncate">{product.metadataCid}</code>
                    <a
                      href={ipfsToHttp(product.metadataCid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Network</p>
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  <span className="text-sm">EVM Localnet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image Card */}
          {ipfsToHttp(product.image) && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Product Image
              </h3>
              <img
                src={ipfsToHttp(product.image)}
                alt={product.name}
                className="w-full rounded-lg border border-border object-cover max-h-64"
              />
              <a
                href={ipfsToHttp(product.image)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                View on IPFS
              </a>
            </div>
          )}

          {/* Description Card */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Description
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Certifications Card */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No certifications yet.</p>
              )}
              {product.certifications.map((cert: any, i: number) => {
                const label = typeof cert === "string" ? cert : (cert.certId || cert.name || JSON.stringify(cert))
                return (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-green-500/10 text-green-400 border-green-500/20"
                  >
                    {label}
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-5 sm:p-6">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-6">
              Supply Chain History
            </h3>

            <SupplyChainTimeline events={timelineEvents.length > 0 ? timelineEvents : []} />
            {timelineEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No history events recorded on-chain yet.
              </p>
            )}
          </div>

          {/* Packaging & Recycling - below timeline */}
          {product.circular_economy && (
            <PackagingRecycling data={product.circular_economy} />
          )}
        </div>
      </div>

      {/* Role-Based Action Panel */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Actions
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Role:</span>
            <Badge variant="outline" className={cn("text-xs", `border-${roleInfo.color.replace("bg-", "")}`)}>
              <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", roleInfo.color)} />
              {roleInfo.label}
            </Badge>
          </div>
        </div>

        {product.status === "revoked" || product.status === "burned" ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
            <Shield className="w-5 h-5 text-destructive shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">This DPP has been revoked</p>
              <p className="text-muted-foreground">No further operations can be performed. You can still consult its details and history above.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Role-specific panels */}
            {currentRole === "consumer" && (
              <ConsumerPanel productStage="retail" dppId={product.id} onAction={loadData} />
            )}

            {currentRole === "farmer" && (
              <FarmerPanel
                dppId={product.id}
                onAction={loadData}
                productData={{
                  origin: product.origin,
                  productionMethod: product.productionMethod,
                  description: product.description,
                  manufacturer: product.manufacturer,
                  variety: product.variety,
                  calibre: product.calibre,
                  brixDegree: product.brixDegree,
                }}
              />
            )}

            {currentRole === "processor" && (
              <ProcessorPanel
                dppId={product.id}
                onAction={loadData}
                productData={{
                  origin: product.origin,
                  productionMethod: product.productionMethod,
                  description: product.description,
                  manufacturer: product.manufacturer,
                  variety: product.variety,
                  calibre: product.calibre,
                  brixDegree: product.brixDegree,
                }}
              />
            )}

            {currentRole === "transporter" && (
              <TransporterPanel dppId={product.id} onAction={loadData} />
            )}

            {currentRole === "retailer" && (
              <RetailerPanel
                dppId={product.id}
                onAction={loadData}
                productData={{
                  origin: product.origin,
                  productionMethod: product.productionMethod,
                  description: product.description,
                  manufacturer: product.manufacturer,
                  variety: product.variety,
                  calibre: product.calibre,
                  brixDegree: product.brixDegree,
                }}
              />
            )}

            {currentRole === "admin" && (
              <AdminPanel
                dppId={product.id}
                onAction={loadData}
                productData={{
                  origin: product.origin,
                  productionMethod: product.productionMethod,
                  description: product.description,
                  manufacturer: product.manufacturer,
                  variety: product.variety,
                  calibre: product.calibre,
                  brixDegree: product.brixDegree,
                }}
              />
            )}
          </>
        )}
      </div>

    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
  monospace = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  monospace?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm text-foreground truncate", monospace && "font-mono")}>
          {value}
        </p>
      </div>
    </div>
  )
}
