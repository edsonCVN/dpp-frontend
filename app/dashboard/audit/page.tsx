"use client"

import { useState, useEffect } from "react"
import {
  ClipboardList,
  Loader2,
  Download,
  ChevronDown,
  ChevronRight,
  Package,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchAuditReport } from "@/lib/api"
import { toast } from "sonner"

interface AuditPassport {
  tokenId: string
  name: string
  owner: string
  status: string
  data: any
  history: any[]
}

interface AuditReport {
  generatedAt: string
  totalPassports: number
  passports: AuditPassport[]
}

export default function AuditPage() {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const loadReport = async () => {
    setIsLoading(true)
    try {
      const data = await fetchAuditReport()
      setReport(data)
    } catch (err: any) {
      toast.error(`Failed to load audit report: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [])

  const toggleExpand = (tokenId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(tokenId)) next.delete(tokenId)
      else next.add(tokenId)
      return next
    })
  }

  const handleExport = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dpp-audit-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Audit report exported")
  }

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "created":
        return "bg-green-500/10 text-green-500"
      case "in_transit":
        return "bg-blue-500/10 text-blue-500"
      case "received":
        return "bg-purple-500/10 text-purple-500"
      case "retail":
        return "bg-orange-500/10 text-orange-500"
      case "revoked":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-sm">Loading audit report from ledger...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Report</h2>
          <p className="text-muted-foreground mt-1">
            Complete supply chain audit trail for all Digital Product Passports on the ledger.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadReport} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!report}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Summary */}
      {report && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Summary</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Passports</p>
              <p className="text-2xl font-bold">{report.totalPassports}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-500">
                {report.passports.filter((p) => p.status?.toLowerCase() !== "revoked").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Revoked</p>
              <p className="text-2xl font-bold text-red-500">
                {report.passports.filter((p) => p.status?.toLowerCase() === "revoked").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Generated At</p>
              <p className="text-sm font-mono mt-1">{new Date(report.generatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Passport List */}
      {report && report.passports.length > 0 ? (
        <div className="space-y-3">
          {report.passports.map((passport) => {
            const isExpanded = expandedIds.has(passport.tokenId)
            return (
              <div key={passport.tokenId} className="glass-card rounded-xl overflow-hidden">
                {/* Row header */}
                <button
                  onClick={() => toggleExpand(passport.tokenId)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{passport.name || `DPP #${passport.tokenId}`}</p>
                      <p className="text-xs text-muted-foreground font-mono">Token #{passport.tokenId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {passport.history.length} event{passport.history.length !== 1 ? "s" : ""}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(passport.status)}`}>
                      {passport.status || "UNKNOWN"}
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4">
                    {/* Owner */}
                    <div className="py-3 text-sm">
                      <span className="text-muted-foreground">Owner: </span>
                      <span className="font-mono text-xs">{passport.owner || "N/A"}</span>
                    </div>

                    {/* History timeline */}
                    {passport.history.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</p>
                        <div className="space-y-1">
                          {passport.history.map((event: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 py-2 px-3 rounded-lg bg-secondary/30 text-sm"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-xs">
                                    {event.eventType || event.type || event.action || "Event"}
                                  </p>
                                  <p className="text-xs text-muted-foreground shrink-0">
                                    {event.timestamp
                                      ? new Date(
                                          typeof event.timestamp === "number" && event.timestamp > 1e12
                                            ? event.timestamp
                                            : Number(event.timestamp) * 1000
                                        ).toLocaleString()
                                      : ""}
                                  </p>
                                </div>
                                {event.actor && (
                                  <p className="text-xs text-muted-foreground font-mono truncate">
                                    by {event.actor}
                                  </p>
                                )}
                                {event.details && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">No history events recorded.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          <p>No passports found on the ledger.</p>
        </div>
      )}
    </div>
  )
}
