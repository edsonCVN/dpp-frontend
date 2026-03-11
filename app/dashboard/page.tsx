"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Search, Filter, LayoutGrid, List, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard, type ProductPassport } from "@/components/product-card"
import { getAllPassports } from "@/lib/api"
import { toast } from "sonner"
import { useRole, ROLES } from "@/contexts/role-context"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [passports, setPassports] = useState<ProductPassport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentRole, roleInfo, hasPermission } = useRole()

  // Fetch true data from Cacti Smart Contract proxy API
  const fetchPassports = async () => {
    setIsLoading(true);
    try {
      const livePassports = await getAllPassports();
      setPassports(livePassports || []);
    } catch (e: any) {
      toast.error(`Could not load passports: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPassports();
  }, [])

  // Filter passports by ownership based on the current role:
  // - Admin: sees all DPPs
  // - Consumer: sees only DPPs owned by the Retailer (public storefront view)
  // - Other roles: see only DPPs they own
  const ownerFilteredPassports = passports.filter((passport) => {
    if (currentRole === "admin") return true
    if (currentRole === "consumer") {
      return passport.ownerAddress?.toLowerCase() === ROLES.retailer.address.toLowerCase()
    }
    return passport.ownerAddress?.toLowerCase() === roleInfo.address.toLowerCase()
  })

  const filteredPassports = ownerFilteredPassports.filter(
    (passport) =>
      passport.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      passport.tokenId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Passports</h2>
          <p className="text-muted-foreground">
            Manage your Digital Product Passports and track their provenance.
          </p>
        </div>
        {hasPermission(["farmer"]) && (
          <Button asChild className="glow-primary shrink-0">
            <Link href="/dashboard/mint">
              <PlusCircle className="w-4 h-4 mr-2" />
              Mint New DPP
            </Link>
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>

          {/* Filter Button */}
          <Button variant="outline" size="sm" className="shrink-0">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total DPPs", value: ownerFilteredPassports.length },
          { label: "Active", value: ownerFilteredPassports.filter((p) => p.status === "active").length },
          { label: "In Transit", value: ownerFilteredPassports.filter((p) => p.status === "in-transit").length },
          { label: "Locked", value: ownerFilteredPassports.filter((p) => p.status === "locked-crosschain").length },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="glass-card rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
           <RefreshCw className="w-8 h-8 animate-spin text-primary" />
           <p className="text-muted-foreground animate-pulse">Syncing with Cacti Ledger...</p>
        </div>
      ) : filteredPassports.length > 0 ? (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-3"
        }>
          {filteredPassports.map((passport, index) => (
            <div 
              key={passport.id} 
              className="animate-fade-in" 
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard product={passport} />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-12 text-center">
           <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
           <p className="text-xl font-medium mb-1">No Passports Minted Yet</p>
           <p className="text-muted-foreground mb-6">Create the first digital passport on the EVM testnet.</p>
           {hasPermission(["farmer"]) && (
             <Button asChild className="glow-primary">
                <Link href="/dashboard/mint">
                <PlusCircle className="w-4 h-4 mr-2" />
                Mint Original Origin Pass
                </Link>
             </Button>
           )}
        </div>
      )}
    </div>
  )
}
