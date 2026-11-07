import { motion } from "framer-motion";
import { AlertTriangle, Clock, MapPin, ChevronRight, Activity } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { useRiskData } from "@/context/RiskProvider";

interface RiskEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  affectedSuppliers: number;
}

// Helper to calculate severity styles
const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "critical":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
    case "high":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" };
    case "medium":
      return { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" };
    case "low":
    default:
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" };
  }
};

const Events = () => {
  const { events } = useRiskData();

  // Transform events for display
  const displayedEvents = events.map(e => ({
    id: String(e.id),
    title: e.event_type,
    description: e.summary,
    location: `${e.location.city}, ${e.location.country}`,
    severity: e.severity_score > 7 ? "critical" : e.severity_score > 4 ? "high" : "low",
    timestamp: new Date(e.timestamp).toLocaleTimeString(),
    affectedSuppliers: (e as any).impacted_nodes?.length || 0
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight">Risk Intelligence Feed</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1 uppercase tracking-[0.1em] font-medium">
          {displayedEvents.filter((e) => e.severity === "critical" || e.severity === "high").length} priority alerts detected in current cycle
        </p>
      </motion.header>

      {/* Events List */}
      <div className="max-w-6xl space-y-4">
        {displayedEvents.map((event, index) => {
          const styles = getSeverityStyles(event.severity);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className={`p-5 cursor-pointer hover:bg-slate-900/40 transition-colors border-l-4 ${styles.border.replace('border', 'border-l')}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium border ${styles.bg} ${styles.text} ${styles.border}`}>
                        {event.severity.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {event.timestamp}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-200 mb-1">{event.title}</h3>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2 leading-relaxed">{event.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {event.affectedSuppliers} supplier{event.affectedSuppliers > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-600 self-center" />
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Events;
