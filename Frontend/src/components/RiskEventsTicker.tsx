import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Anchor, ShieldAlert } from "lucide-react";
import { useRiskData } from "@/context/RiskProvider";

const RiskEventsTicker = () => {
    const { events } = useRiskData();

    return (
        <div className="w-full bg-[#020617] border-b border-white/10 overflow-hidden h-9 flex items-center relative z-50 backdrop-blur-xl">
            <div className="bg-red-500/10 px-4 h-full flex items-center border-r border-white/10 z-10 shrink-0">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] animate-pulse flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> LIVE INTELLIGENCE FEED
                </span>
            </div>

            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                <motion.div
                    className="flex gap-16 whitespace-nowrap absolute"
                    animate={{ x: [0, -2000] }}
                    transition={{
                        duration: 60,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    {(events.length > 0 ? [...events, ...events, ...events] : []).map((item, i) => {
                        return (
                            <div key={`${item.id}-${i}`} className="flex items-center gap-3 text-[11px]">
                                <span className={`font-bold px-1 rounded-[2px] ${(item.severity_score ?? 0) > 7 ? 'text-red-400 bg-red-400/10' : 'text-amber-400 bg-amber-400/10'
                                    }`}>
                                    {item.source === "USGS" ? `USGS · M${item.magnitude}` : item.event_type}
                                </span>
                                <span className="text-white/70 font-medium tracking-wide">
                                    {item.summary}
                                </span>
                                <span className="text-white/20 font-mono">[{item.location.city.toUpperCase()}]</span>
                                <span className="text-white/10 mx-4">///</span>
                            </div>
                        );
                    })}
                    {events.length === 0 && (
                        <div className="text-white/30 text-[11px] px-4 font-mono">SCANNING GLOBAL CHANNELS... NO ACTIVE DISRUPTIONS DETECTED</div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default RiskEventsTicker;
