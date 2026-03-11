"use client"

import { Recycle, Package, Leaf, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PackagingItem {
  material: string
  recyclability: string
  disposal: string
}

interface CircularEconomyData {
  packaging: PackagingItem[]
  instructions: string
  return_scheme: string
}

const disposalColors: Record<string, string> = {
  "Blue Bin": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Yellow Bin": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Green Bin": "bg-green-500/10 text-green-400 border-green-500/20",
}

function getDisposalColor(disposal: string): string {
  for (const [key, color] of Object.entries(disposalColors)) {
    if (disposal.includes(key)) return color
  }
  return "bg-muted text-muted-foreground border-border"
}

export function PackagingRecycling({ data }: { data: CircularEconomyData }) {
  return (
    <div className="glass-card rounded-xl p-5 sm:p-6 space-y-5">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Packaging & Recycling
      </h3>

      {/* Packaging Materials */}
      <div className="space-y-3">
        {data.packaging.map((item, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.material}</p>
                <p className="text-xs text-muted-foreground">{item.recyclability}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:shrink-0">
              <ArrowRight className="w-3 h-3 text-muted-foreground hidden sm:block" />
              <Badge
                variant="outline"
                className={getDisposalColor(item.disposal)}
              >
                <Recycle className="w-3 h-3 mr-1" />
                {item.disposal}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="p-3 rounded-lg bg-secondary/20 border border-border">
        <div className="flex items-start gap-3">
          <Recycle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Recycling Instructions
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {data.instructions}
            </p>
          </div>
        </div>
      </div>

      {/* Return Scheme */}
      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
        <div className="flex items-start gap-3">
          <Leaf className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-green-400 uppercase tracking-wide mb-1">
              Circular Economy Incentive
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {data.return_scheme}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
