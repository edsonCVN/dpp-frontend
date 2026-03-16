"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type UserRole = 
  | "consumer" 
  | "farmer" 
  | "processor" 
  | "transporter" 
  | "retailer" 
  | "admin"

export interface RoleInfo {
  id: UserRole
  label: string
  description: string
  color: string
  userName: string
  address: string
}

export const ROLES: Record<UserRole, RoleInfo> = {
  consumer: {
    id: "consumer",
    label: "Consumer (Public)",
    description: "Read-only access to product history and certifications",
    color: "bg-slate-500",
    userName: "Maria (Consumer)",
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
  },
  farmer: {
    id: "farmer",
    label: "Farmer",
    description: "Can mint new origin passports and certify products",
    color: "bg-green-500",
    userName: "Quinta da Gardunha (Registered Farmer)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  },
  processor: {
    id: "processor",
    label: "Processor",
    description: "Can aggregate products, amend metadata, add certifications",
    color: "bg-amber-500",
    userName: "Cerfundão Cooperative",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  },
  transporter: {
    id: "transporter",
    label: "Transporter",
    description: "Can log shipping data and transport conditions",
    color: "bg-blue-500",
    userName: "Global Logistics Ltd",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
  },
  retailer: {
    id: "retailer",
    label: "Retailer",
    description: "Can mark products as available and update retail data",
    color: "bg-purple-500",
    userName: "Continente Retail Group",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
  },
  admin: {
    id: "admin",
    label: "Admin/Gateway",
    description: "Full access including cross-chain transfers and role management",
    color: "bg-red-500",
    userName: "System Administrator",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  },
}

interface RoleContextType {
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  roleInfo: RoleInfo
  hasPermission: (allowedRoles: UserRole[]) => boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("consumer")

  const roleInfo = ROLES[currentRole]

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (currentRole === "admin") return true
    return allowedRoles.includes(currentRole)
  }

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, roleInfo, hasPermission }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
