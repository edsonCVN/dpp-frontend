"use client"

import { useState } from "react"
import { 
  Wallet, 
  Globe, 
  Bell, 
  Shield,
  Save,
  ExternalLink,
  Check,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  // Mock settings state
  const [settings, setSettings] = useState({
    network: "evm-local",
    gasLimit: "300000",
    notifications: true,
    autoRefresh: true,
    debugMode: false,
  })

  const walletAddress = "0x4A67B89c12d45E789F012345678901234567A319"

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Configure your wallet connection and application preferences.
        </p>
      </div>

      {/* Wallet Section */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Wallet Connection
        </h3>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Connected Address</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 rounded-lg bg-secondary/50 border border-border font-mono text-sm truncate">
                {walletAddress}
              </code>
              <Button variant="outline" size="icon" onClick={copyAddress}>
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-400">Wallet Connected</span>
          </div>
        </div>
      </div>

      {/* Network Section */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Network Configuration
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="network">Active Network</Label>
            <Select 
              value={settings.network} 
              onValueChange={(value) => setSettings({ ...settings, network: value })}
            >
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evm-local">EVM Localnet</SelectItem>
                <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                <SelectItem value="goerli">Goerli Testnet</SelectItem>
                <SelectItem value="mainnet">Ethereum Mainnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gasLimit">Default Gas Limit</Label>
            <Input
              id="gasLimit"
              value={settings.gasLimit}
              onChange={(e) => setSettings({ ...settings, gasLimit: e.target.value })}
              className="bg-secondary/50 border-border focus:border-primary font-mono"
            />
          </div>

          <a
            href="https://etherscan.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View on Block Explorer
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notifications
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Transaction Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive alerts when transactions are confirmed
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-Refresh Dashboard</p>
              <p className="text-xs text-muted-foreground">
                Automatically update passport data
              </p>
            </div>
            <Switch
              checked={settings.autoRefresh}
              onCheckedChange={(checked) => setSettings({ ...settings, autoRefresh: checked })}
            />
          </div>
        </div>
      </div>

      {/* Advanced Section */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Advanced Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Debug Mode</p>
              <p className="text-xs text-muted-foreground">
                Show detailed transaction logs and contract calls
              </p>
            </div>
            <Switch
              checked={settings.debugMode}
              onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
            />
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">SATP DPP Version:</span> 1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">Smart Contract:</span> v2.1.0 (ERC-721)
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="glow-primary">
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
