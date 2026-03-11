"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Shield, 
  ArrowRight, 
  Fingerprint, 
  Route, 
  Network, 
  Menu,
  X,
  ExternalLink,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const scrollToSection = useCallback((sectionId: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 pointer-events-none" />
      
      {/* Floating orbs for depth */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">SATP DPP</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection("features")} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("how-it-works")} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </button>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Documentation
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Sign In</Link>
              </Button>
              <Button size="sm" className="glow-primary" asChild>
                <Link href="/dashboard">
                  Launch App
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <button 
                onClick={() => scrollToSection("features")} 
                className="block text-sm text-muted-foreground hover:text-foreground w-full text-left"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("how-it-works")} 
                className="block text-sm text-muted-foreground hover:text-foreground w-full text-left"
              >
                How It Works
              </button>
              <Link href="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
              <div className="pt-3 border-t border-border space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard">Sign In</Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/dashboard">Launch App</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-xs font-medium text-muted-foreground mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Powered by Hyperledger Cacti
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in stagger-1 text-balance">
              The Future of{" "}
              <span className="text-primary">Cross-Chain</span>{" "}
              Provenance
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in stagger-2 text-pretty">
              Enterprise-grade Digital Product Passports with SATP interoperability. 
              Track the complete lifecycle of physical goods across multiple blockchain networks with immutable, verifiable records.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-3">
              <Button size="lg" className="glow-primary w-full sm:w-auto" asChild>
                <Link href="/dashboard">
                  Launch App
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => scrollToSection("how-it-works")}
              >
                Learn More
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 animate-fade-in stagger-4">
              {[
                { value: "ERC-721", label: "NFT Standard" },
                { value: "SATP", label: "Protocol" },
                { value: "Multi-Chain", label: "Support" },
                { value: "100%", label: "On-Chain" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for the demands of modern supply chain management with blockchain-backed security and cross-chain interoperability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <FeatureCard
              icon={<Fingerprint className="w-6 h-6" />}
              title="NFT-Based Passports"
              description="Each product receives a unique ERC-721 token that serves as its immutable digital identity, ensuring authenticity and preventing counterfeiting."
              badge="ERC-721"
            />

            {/* Feature 2 */}
            <FeatureCard
              icon={<Route className="w-6 h-6" />}
              title="Supply Chain Traceability"
              description="Track every touchpoint in your product's journey with timestamped, cryptographically signed records that cannot be altered or deleted."
              badge="Immutable"
            />

            {/* Feature 3 */}
            <FeatureCard
              icon={<Network className="w-6 h-6" />}
              title="SATP Interoperability"
              description="Seamlessly transfer product passports between different blockchain networks using the Secure Asset Transfer Protocol with Hermes Gateway integration."
              badge="Cross-Chain"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How SATP DPP Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From minting to cross-chain transfer, every step is secured by smart contracts and cryptographic proofs.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Mint DPP",
                description: "Create a new Digital Product Passport with product metadata stored on IPFS."
              },
              {
                step: "02",
                title: "Track Provenance",
                description: "Record supply chain events as the product moves through its lifecycle."
              },
              {
                step: "03",
                title: "Initiate Transfer",
                description: "When ready, lock the asset on the source chain and initiate SATP."
              },
              {
                step: "04",
                title: "Cross-Chain Complete",
                description: "Hermes Gateway facilitates secure transfer to the destination network."
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="glass-card rounded-xl p-6 h-full">
                  <div className="text-4xl font-bold text-primary/30 mb-4">{item.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-8 sm:p-12 glow-primary">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Connect your wallet and start minting Digital Product Passports with full supply chain traceability.
            </p>
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard">
                Launch Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">SATP DPP</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Built with Hyperledger Cacti and Solidity Smart Contracts
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button onClick={() => scrollToSection("features")} className="hover:text-foreground transition-colors">Features</button>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  badge 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  badge: string
}) {
  return (
    <div className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">
          {badge}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
