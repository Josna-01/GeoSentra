import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Activity, ShieldAlert, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RiskMap, { Supplier } from "@/components/RiskMap";
import SupplierDrawer from "@/components/SupplierDrawer";
import RiskEventsTicker from "@/components/RiskEventsTicker";
import MarketWidget from "@/components/MarketWidget";
import GraphStreamWidget from "@/components/GraphStreamWidget";
import SatelliteWidget from "@/components/SatelliteWidget";
import { useRiskData, RiskEvent } from "@/context/RiskProvider";
import { toast } from "sonner";

const Dashboard = () => {
  const { suppliers: contextSuppliers, events, usgsStatus, simulateCrisis, fetchData } = useRiskData();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const estimatedCosts = events.flatMap(event => event.impact_cost === undefined ? [] : [event.impact_cost]);

  const suppliers = useMemo(() => {
    if (!searchQuery) return contextSuppliers;
    return contextSuppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, contextSuppliers]);

  const handleSyncNews = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("http://localhost:8000/risk/ingest-news", { method: "POST" });
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(typeof error?.detail === "string" ? error.detail : "News sync failed. Try again later.");
        return;
      }
      const { processed } = await res.json();
      if (processed === 0) {
        toast.info("No new news alerts.");
      } else {
        toast.success(`Added ${processed} new news ${processed === 1 ? "alert" : "alerts"}.`);
        await fetchData();
      }
    } catch (err) {
      toast.error("Failed to connect to intelligence feed.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-inter select-none">
      <RiskEventsTicker />

      {/* Main Content - Full Screen Map with Overlays */}
      <div className="flex-1 relative overflow-hidden">

        {/* Full Screen Map */}
        <div className="absolute inset-0 z-0">
          <RiskMap
            suppliers={suppliers}
            onSupplierSelect={setSelectedSupplier}
            selectedSupplier={selectedSupplier}
          />
        </div>

        {/* Top Bar - Metrics HUD */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">

          {/* Left: Sync Button */}
          <div className="pointer-events-auto">
            <Button
              onClick={handleSyncNews}
              disabled={isSyncing}
              className="h-10 px-4 bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium backdrop-blur-md shadow-lg rounded-lg transition-all hover:shadow-blue-900/20 hover:border-blue-500/30"
            >
              <Activity className={`w-3.5 h-3.5 mr-2 ${isSyncing ? 'animate-spin' : 'text-blue-400'}`} />
              {isSyncing ? "SYNCING..." : "SYNC INTEL"}
            </Button>
          </div>

          {/* Center: Key Metrics */}
          <div className="pointer-events-auto flex gap-3">
            <div className="px-5 py-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl">
              <div className="text-[9px] uppercase text-slate-500 tracking-widest font-semibold mb-1">Recent Events</div>
              <div className={`text-2xl font-bold tracking-tight ${events.length > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                {events.length}
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl">
              <div className="text-[9px] uppercase text-slate-500 tracking-widest font-semibold mb-1">Avg Impact Cost</div>
              <div className="text-2xl font-bold tracking-tight text-slate-200">
                {estimatedCosts.length
                  ? `$${(estimatedCosts.reduce((sum, cost) => sum + cost, 0) / estimatedCosts.length / 1000).toFixed(1)}k`
                  : "—"}
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl">
              <div className="text-[9px] uppercase text-slate-500 tracking-widest font-semibold mb-1">USGS Earthquake Feed</div>
              <div className="text-lg font-bold uppercase">{usgsStatus?.status ?? "checking"}</div>
              {usgsStatus?.last_success_at && (
                <div className="text-xs text-slate-400">
                  Last fetched {new Date(usgsStatus.last_success_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Right: Status Indicator */}
          <div className="pointer-events-auto px-4 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2 backdrop-blur-md">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            LIVE
          </div>
        </div>

        {/* Left Panel - Network Nodes (Collapsible) */}
        <div className="absolute left-4 top-24 bottom-4 z-20 w-80 pointer-events-auto">
          <div className="h-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2 mb-3">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Network Nodes
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <Input
                  placeholder="Search nodes..."
                  className="pl-9 h-8 bg-slate-950 border-slate-700 text-xs text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/50 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Nodes List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {suppliers.slice(0, 10).map(s => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedSupplier(s)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 group relative overflow-hidden ${s.status === 'risk' ? 'bg-red-950/20 border-red-900/40 hover:bg-red-950/30' :
                    s.status === 'warning' ? 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/30' :
                      'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                    }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.status === 'risk' ? 'bg-red-500' :
                    s.status === 'warning' ? 'bg-amber-500' :
                      'bg-slate-600'
                    }`} />

                  <div className="pl-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-200 truncate">{s.name}</span>
                      <span className="text-xs font-mono text-slate-400">{s.riskLevel}%</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {s.country} • {s.category}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Intelligence Feed */}
        <div className="absolute right-4 top-24 bottom-4 z-20 w-96 pointer-events-auto">
          <div className="h-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Intelligence Feed
              </h2>
              <div className="px-2 py-0.5 bg-red-950/30 border border-red-900/50 rounded text-[9px] font-bold text-red-400 tracking-widest">
                LIVE
              </div>
            </div>

            {/* Events Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active threats detected</p>
                  <p className="text-xs mt-1">System monitoring in progress</p>
                </div>
              ) : (
                events.map((e: RiskEvent) => (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={e.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 relative overflow-hidden group hover:border-slate-600 transition-colors"
                  >
                    {/* Severity Indicator */}
                    {(e.severity_score ?? 0) > 7 && (
                      <div className="absolute top-2 right-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${(e.severity_score ?? 0) > 7 ? 'bg-red-950/30 border-red-900/50 text-red-400' :
                        (e.severity_score ?? 0) > 4 ? 'bg-amber-950/30 border-amber-900/50 text-amber-400' :
                          'bg-slate-700 border-slate-600 text-slate-400'
                        }`}>
                        {e.source === "USGS" ? `USGS · M${e.magnitude}` : e.event_type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-xs font-medium text-slate-200 mb-2 leading-relaxed">{e.summary}</h3>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-slate-900/50 rounded px-2 py-1.5 border border-slate-800/50">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Location</div>
                        <div className="text-[10px] text-slate-300 truncate">{[e.location.city, e.location.country].filter(Boolean).join(", ")}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded px-2 py-1.5 border border-slate-800/50">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Impact</div>
                        <div className="text-[10px] text-slate-300 font-mono">
                          {e.source === "USGS" ? "Unassessed" : `${e.predicted_days?.toFixed(1) || "?"} Days`}
                        </div>
                      </div>
                    </div>

                    {e.source === "USGS" ? (
                      <a className="text-xs text-cyan-300 hover:underline" href={e.source_url} target="_blank" rel="noreferrer">View USGS report</a>
                    ) : <Button
                      size="sm"
                      variant="ghost"
                      className="w-full h-7 text-[10px] bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-300 border border-slate-600 hover:border-blue-500 transition-all uppercase tracking-wide font-medium"
                      onClick={() => toast.info(`Drafting RFQ for ${e.event_type}...`)}
                    >
                      <Mail className="w-3 h-3 mr-2" /> Initiate Response
                    </Button>}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {selectedSupplier && (
        <SupplierDrawer
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
