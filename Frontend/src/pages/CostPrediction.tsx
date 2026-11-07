import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, AlertTriangle, Calendar, Search, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";

interface Prediction {
    event_type: string;
    predicted_cost_usd: number;
    predicted_disruption_days: number;
    stockout_probability: number;
    stockout_risk_level: string;
    cost_severity_level: string;
    daily_revenue_loss: number;
    expedited_shipping_cost: number;
    confidence: number;
    sample_size: number;
}

const CostPrediction = () => {
    const [eventTypes, setEventTypes] = useState<string[]>([]);
    const [selectedEventType, setSelectedEventType] = useState("");
    const [country, setCountry] = useState("");
    const [severity, setSeverity] = useState(5);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEventTypes();
    }, []);

    const fetchEventTypes = async () => {
        try {
            const res = await fetch("http://localhost:8000/prediction/event-types");
            const data = await res.json();
            setEventTypes(data.event_types || []);
            if (data.event_types && data.event_types.length > 0) {
                setSelectedEventType(data.event_types[0]);
            }
        } catch (error) {
            console.error("Failed to fetch event types:", error);
        }
    };

    const handlePredict = async () => {
        if (!selectedEventType) return;

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/prediction/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_type: selectedEventType,
                    country: country || null,
                    severity: severity
                })
            });
            const data = await res.json();
            if (data.status === "success") {
                setPrediction(data.prediction);
            }
        } catch (error) {
            console.error("Failed to predict:", error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case "LOW": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
            case "MEDIUM": return "text-amber-400 border-amber-500/20 bg-amber-500/5";
            case "HIGH": return "text-red-400 border-red-500/20 bg-red-500/5";
            default: return "text-slate-400 border-slate-700 bg-slate-800/5";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <Cpu className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gradient">Cost Impact Prediction</h1>
                        <p className="text-slate-400 text-sm">Predictive forecasting engine powered by 73,000+ historical disruption scenarios</p>
                    </div>
                </div>
            </motion.header>

            {/* Prediction Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <GlassCard className="p-8">
                    <div className="flex items-center gap-2 mb-6 text-slate-200">
                        <Search className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-xl font-bold">Configure Simulation</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                        <div className="md:col-span-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Disruption Event Type</label>
                            <select
                                value={selectedEventType}
                                onChange={(e) => setSelectedEventType(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 outline-none transition-all"
                            >
                                {eventTypes.map((type) => (
                                    <option key={type} value={type} className="bg-slate-900">{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Market / Country</label>
                            <Input
                                placeholder="Global Average"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="bg-slate-900/50 border-slate-700/50 text-slate-200 py-6"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">Severity Intensity ({severity})</label>
                            <div className="flex items-center gap-4 px-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={severity}
                                    onChange={(e) => setSeverity(Number(e.target.value))}
                                    className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handlePredict}
                        disabled={loading || !selectedEventType}
                        className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wide shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing Neural Analysis...
                            </div>
                        ) : (
                            "GENERATE PREDICTIVE ANALYSIS"
                        )}
                    </Button>
                </GlassCard>
            </motion.div>

            {/* Results */}
            {prediction && (
                <div className="space-y-6">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4"
                    >
                        Analysis Results
                    </motion.h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Total Cost */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <GlassCard className="p-6 border-cyan-500/20 bg-cyan-500/5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-300">Total Financial Impact</h3>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white">${prediction.predicted_cost_usd.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500 font-mono">USD</span>
                                </div>
                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Daily Burn Rate</span>
                                        <span className="text-slate-300">${prediction.daily_revenue_loss.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="bg-cyan-500 h-full w-2/3 shadow-[0_0_8px_cyan]"></div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Disruption Days */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                            <GlassCard className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-amber-500/20 rounded-lg">
                                        <Calendar className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-300">Estimated Downtime</h3>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-amber-400">{prediction.predicted_disruption_days.toFixed(1)}</span>
                                    <span className="text-sm text-slate-500 uppercase tracking-widest font-bold">Days</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                                    Expected lead-time delay and operational halt duration.
                                </p>
                            </GlassCard>
                        </motion.div>

                        {/* Stockout Risk */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                            <GlassCard className={`p-6 border ${getRiskColor(prediction.stockout_risk_level)}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold">Inventory Vulnerability</h3>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black">{prediction.stockout_risk_level}</span>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="opacity-60 uppercase tracking-tighter">Stockout Probability</span>
                                        <span className="font-bold">{prediction.stockout_probability.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${prediction.stockout_probability}%` }}
                                            className="bg-current h-full"
                                        />
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard className="p-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Logistics Overhead</h4>
                            <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-lg border border-slate-800/50">
                                <span className="text-slate-400">Expedited Shipping Premium</span>
                                <span className="text-xl font-bold text-slate-100">${prediction.expedited_shipping_cost.toLocaleString()}</span>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Model Reliability</h4>
                            <div className="flex items-center gap-6">
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4" className="stroke-slate-800" />
                                        <motion.circle
                                            cx="32" cy="32" r="28" fill="none" strokeWidth="4"
                                            className="stroke-emerald-400"
                                            strokeDasharray="176"
                                            initial={{ strokeDashoffset: 176 }}
                                            animate={{ strokeDashoffset: 176 - (176 * prediction.confidence) / 100 }}
                                        />
                                    </svg>
                                    <span className="absolute text-[10px] font-bold text-emerald-400">{prediction.confidence.toFixed(0)}%</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Confidence Rating</p>
                                    <p className="text-xs text-slate-500">Based on {prediction.sample_size} correlated historical datasets</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostPrediction;
