"use client"

import { 
  Package, 
  Truck, 
  Building, 
  CheckCircle,
  MapPin,
  Clock,
  FileText,
  User,
  Sprout,
  Award,
  Layers,
  Thermometer,
  Store
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineEvent {
  id: string
  type: "created" | "shipped" | "received" | "inspection" | "transfer" | "harvest" | "certification" | "aggregated" | "telemetry" | "retail"
  title: string
  description: string
  location: string
  timestamp: string
  actor: string
  txHash?: string
}

const eventIcons: Record<TimelineEvent["type"], React.ElementType> = {
  created: Sprout,
  harvest: Package,
  certification: Award,
  aggregated: Layers,
  shipped: Truck,
  telemetry: Thermometer,
  received: Building,
  inspection: FileText,
  transfer: CheckCircle,
  retail: Store,
}

const eventColors: Record<TimelineEvent["type"], string> = {
  created: "bg-green-500/20 text-green-400 border-green-500/30",
  harvest: "bg-green-500/20 text-green-400 border-green-500/30",
  certification: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  aggregated: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  telemetry: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  received: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  inspection: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  transfer: "bg-primary/20 text-primary border-primary/30",
  retail: "bg-pink-500/20 text-pink-400 border-pink-500/30",
}

export function SupplyChainTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      {/* Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = eventIcons[event.type]
          const colorClass = eventColors[event.type]

          return (
            <div 
              key={event.id} 
              className="relative flex gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                colorClass
              )}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 glass-card rounded-xl p-4 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{event.title}</h4>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {event.timestamp}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{event.actor}</span>
                  </div>
                </div>

                {event.txHash && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-foreground font-medium">TX: </span>
                      <code className="text-primary">{event.txHash}</code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
