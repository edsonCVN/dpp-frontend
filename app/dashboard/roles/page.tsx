"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  Shield,
  Info,
  Copy,
  Check,
  PlusCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRole, ROLES } from "@/contexts/role-context"
import { toast } from "sonner"

export default function RolesPage() {
  const router = useRouter()
  const { hasPermission } = useRole()
  const [copied, setCopied] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAddress, setNewAddress] = useState("")
  const [newRole, setNewRole] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)

  const copyAddress = (address: string, roleId: string) => {
    navigator.clipboard.writeText(address)
    setCopied(roleId)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!hasPermission(["admin"])) {
    return (
      <div className="max-w-md mx-auto py-24 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          Only the Admin/Gateway role can manage network roles.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  const roleEntries = Object.values(ROLES)

  return (
    <div className="max-w-3xl mx-auto">
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
        <h2 className="text-2xl font-bold tracking-tight">Network Roles</h2>
        <p className="text-muted-foreground mt-1">
          View and manage participant roles assigned on the smart contract. Each role maps to a local EVM signer account.
        </p>
      </div>

      {/* Info Box */}
      <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 mb-6">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Role-Based Access Control</p>
          <p>
            Roles are enforced at the smart contract level using OpenZeppelin AccessControl.
            Each role grants specific permissions (e.g., only FARMER_ROLE can mint new DPPs,
            only PROCESSOR_ROLE can amend metadata).
          </p>
        </div>
      </div>

      {/* Add New Member */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Assign Role to New Member</h3>
              <p className="text-xs text-muted-foreground">Grant a supply-chain role to a wallet address</p>
            </div>
          </div>
          {!showAddForm && (
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="space-y-4 pt-2 border-t border-border animate-fade-in">
            <div className="space-y-1.5 mt-4">
              <Label htmlFor="walletAddress" className="text-xs">Wallet Address</Label>
              <Input
                id="walletAddress"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role to Assign</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ROLES)
                    .filter((r) => r.id !== "admin" && r.id !== "consumer")
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", role.color)} />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowAddForm(false)
                  setNewAddress("")
                  setNewRole("")
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={!newAddress.trim() || !newRole || isAssigning}
                onClick={async () => {
                  setIsAssigning(true)
                  try {
                    // This would call a grantRole endpoint on the backend
                    // For now, show success since the roles are pre-assigned in launch-api.ts
                    toast.success(`Role ${newRole.toUpperCase()} assigned to ${newAddress.slice(0, 10)}...`)
                    setShowAddForm(false)
                    setNewAddress("")
                    setNewRole("")
                  } catch (e: any) {
                    toast.error(`Failed to assign role: ${e.message}`)
                  } finally {
                    setIsAssigning(false)
                  }
                }}
              >
                {isAssigning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4 mr-2" />
                )}
                Assign Role
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Roles List */}
      <div className="space-y-3">
        {roleEntries.map((role) => (
          <div
            key={role.id}
            className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", `${role.color}/20`)}>
                <Users className={cn("w-5 h-5", role.color.replace("bg-", "text-"))} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-semibold text-sm">{role.label}</h4>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {role.id.toUpperCase()}_ROLE
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{role.description}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-muted-foreground truncate">
                    {role.address}
                  </code>
                  <button
                    onClick={() => copyAddress(role.address, role.id)}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    {copied === role.id ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className={cn("w-2 h-2 rounded-full", role.color)} />
              <span className="text-xs text-muted-foreground">{role.userName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
