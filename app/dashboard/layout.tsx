"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Shield,
  LayoutDashboard,
  PlusCircle,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Globe,
  UserCog,
  ChevronDown,
  ArrowRightLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoleProvider, useRole, ROLES, type UserRole } from "@/contexts/role-context"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  requiredRoles?: string[]
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "My Passports", icon: LayoutDashboard },
  { href: "/dashboard/mint", label: "Mint New DPP", icon: PlusCircle, requiredRoles: ["farmer"] },
  { href: "/dashboard/aggregate", label: "Aggregate Lots", icon: Layers, requiredRoles: ["farmer", "processor", "admin"] },
  { href: "/dashboard/transfer", label: "Transfer DPP", icon: ArrowRightLeft, requiredRoles: ["farmer", "processor", "transporter", "retailer", "admin"] },
  { href: "/dashboard/roles", label: "Manage Roles", icon: UserCog, requiredRoles: ["admin"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </RoleProvider>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const { currentRole, setCurrentRole, roleInfo, hasPermission } = useRole()

  const visibleNavItems = navItems.filter((item) =>
    !item.requiredRoles || hasPermission(item.requiredRoles as any)
  )

  // Wallet address is now dynamically tied to the active role
  const walletAddress = `${roleInfo.address.slice(0, 6)}...${roleInfo.address.slice(-3)}`
  const networkName = "EVM Localnet"

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-lg tracking-tight animate-fade-in">SATP DPP</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-sidebar-primary/10 text-sidebar-primary" 
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-sidebar-primary")} />
                    {!sidebarCollapsed && (
                      <span>{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="px-2 pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-semibold">
              {pathname.startsWith("/dashboard/passport/") 
                ? "Passport Details"
                : navItems.find(item => 
                    pathname === item.href || 
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  )?.label || "My Passports"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className={cn("w-2 h-2 rounded-full", roleInfo.color)} />
                  <UserCog className="w-4 h-4" />
                  <span className="hidden sm:inline">{roleInfo.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Simulate User Role
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(ROLES).map((role) => (
                  <DropdownMenuItem
                    key={role.id}
                    onClick={() => { setCurrentRole(role.id as UserRole); router.push("/dashboard") }}
                    className={cn(
                      "flex flex-col items-start gap-0.5 py-2",
                      currentRole === role.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", role.color)} />
                      <span className="font-medium">{role.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground pl-4">
                      {role.description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Network Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-xs">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">{networkName}</span>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground font-medium hidden sm:inline">Connected:</span>
              <span className="text-foreground font-medium">{walletAddress}</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
