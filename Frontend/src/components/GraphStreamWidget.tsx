import { useEffect, useState } from "react";
import { Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface GraphMetric {
    timestamp: string;
    active_nodes: number;
    risk_nodes: number;
    warning_nodes: number;
    safe_nodes: number;
    total_alerts: number;
    avg_risk_score: number;
    network_health: number;
}

const GraphStreamWidget = () => {
    const [metrics, setMetrics] = useState<GraphMetric[]>([]);
    const [latest, setLatest] = useState<GraphMetric | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch("http://localhost:8000/stream/graph-metrics?minutes=10");
                const data = await res.json();
                setMetrics(data.metrics || []);
                setLatest(data.latest);
            } catch (error) {
                console.error("Failed to fetch graph metrics:", error);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (!latest) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Network Pulse</h3>
                </div>
                <div className="text-xs text-slate-500">Initializing...</div>
            </div>
        );
    }

    const healthColor = latest.network_health > 80 ? 'text-emerald-400' :
        latest.network_health > 60 ? 'text-amber-400' : 'text-red-400';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-4 shadow-xl min-w-[320px]"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Network Pulse</h3>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-slate-500 font-mono">LIVE</span>
                </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Network Health</div>
                    <div className={`text-xl font-bold ${healthColor}`}>
                        {latest.network_health.toFixed(1)}%
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Avg Risk</div>
                    <div className="text-xl font-bold text-slate-200">
                        {latest.avg_risk_score.toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Node Distribution */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Active Nodes</span>
                    <span className="font-mono text-slate-300">{latest.active_nodes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-400">Risk</span>
                    </div>
                    <span className="font-mono text-red-400">{latest.risk_nodes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-slate-400">Warning</span>
                    </div>
                    <span className="font-mono text-amber-400">{latest.warning_nodes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-400">Safe</span>
                    </div>
                    <span className="font-mono text-emerald-400">{latest.safe_nodes}</span>
                </div>
            </div>

            {/* Mini Trend Line */}
            <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600 uppercase tracking-wider">
                        Last 10min trend
                    </span>
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                </div>
            </div>
        </motion.div>
    );
};

export default GraphStreamWidget;
