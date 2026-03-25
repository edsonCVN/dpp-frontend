"use client"

import Link from "next/link"
import { 
  Package, 
  Calendar, 
  ArrowUpRight,
  Lock,
  Truck,
  CheckCircle,
  ShoppingBag,
  ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ipfsToHttp } from "@/lib/ipfs"

export type ProductStatus = "created" | "in-transit" | "received" | "locked"
  | "locked-crosschain"
  | "retail"
  | "revoked"

export interface ProductPassport {
  id: string
  tokenId: string
  name: string
  createdAt: string
  status: ProductStatus
  ipfsUri?: string
  ownerAddress?: string
  image?: string
}

const statusConfig: Record<ProductStatus, { label: string; className: string; icon: React.ElementType }> = {
  created: {
    label: "Active Passport",
    className: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: CheckCircle,
  },
  "in-transit": {
    label: "In Transit",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Truck,
  },
  received: {
    label: "Available",
    className: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    icon: CheckCircle,
  },
  locked: {
    label: "Locked",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: Lock,
  },
  "locked-crosschain": {
    label: "Escrowed Out",
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: Lock,
  },
  retail: {
    label: "Retail Ready",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: ShoppingBag,
  },
  revoked: {
    label: "Revoked",
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    icon: ShieldAlert,
  }
}

export function ProductCard({ product }: { product: ProductPassport }) {
  const statusInfo = statusConfig[product.status] ?? statusConfig.created
  const StatusIcon = statusInfo.icon

  return (
    <Link href={`/dashboard/passport/${product.id}`}>
      <div className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 group cursor-pointer h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {product.image && ipfsToHttp(product.image) ? (
            <img
              src={ipfsToHttp(product.image)}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          )}
          <Badge variant="outline" className={cn("text-xs font-medium", statusInfo.className)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Product ID</p>
            <p className="font-mono text-sm text-foreground">{product.tokenId}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Name</p>
            <p className="font-medium text-foreground truncate">{product.name}</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{product.createdAt}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">View Details</span>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  )
}
