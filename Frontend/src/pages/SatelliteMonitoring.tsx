import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Satellite, MapPin, Calendar, AlertTriangle, Activity, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";

interface SatelliteEvent {
    id: string;
    title: string;
    category: string;
    location: {
        coordinates: [number, number];
    };
    date: string;
    source: string;
    link?: string;
}

interface PortWeather {
    name: string;
    location: string;
    coordinates: [number, number];
    weather?: {
        wave_height_m: number;
        wind_wave_height_m: number;
        swell_wave_height_m: number;
        ocean_current_speed: number;
        timestamp: string;
    };
    status: string;
    source: string;
}

const MAJOR_PORTS = [
    "Shanghai", "Singapore", "Rotterdam", "Hamburg", "Los Angeles",
    "Long Beach", "Antwerp", "Dubai", "New York", "Busan",
    "Hong Kong", "Qingdao", "Guangzhou", "Tianjin", "Port Klang"
];

const SatelliteMonitoring = () => {
    const [events, setEvents] = useState<SatelliteEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [portSearch, setPortSearch] = useState("");
    const [portSuggestions, setPortSuggestions] = useState<string[]>([]);
    const [portData, setPortData] = useState<PortWeather | null>(null);
    const [portLoading, setPortLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("http://localhost:8000/satellite/events?limit=30");
                const data = await res.json();
                setEvents(data.events || []);
            } catch (error) {
                console.error("Failed to fetch satellite events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 300000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (portSearch.length > 0) {
            const filtered = MAJOR_PORTS.filter(port =>
                port.toLowerCase().includes(portSearch.toLowerCase())
            );
            setPortSuggestions(filtered);
        } else {
            setPortSuggestions([]);
        }
    }, [portSearch]);

    const handlePortSearch = async (port?: string) => {
        const searchPort = port || portSearch;
        if (!searchPort.trim()) return;

        setPortLoading(true);
        setPortSuggestions([]);
        try {
            const res = await fetch(`http://localhost:8000/satellite/port-activity?port=${searchPort.toLowerCase()}`);
            const data = await res.json();
            setPortData(data);
        } catch (error) {
            console.error("Failed to fetch port data:", error);
        } finally {
            setPortLoading(false);
        }
    };

    const selectPort = (port: string) => {
        setPortSearch(port);
        handlePortSearch(port);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Satellite className="w-8 h-8 text-cyan-400" />
                            <h1 className="text-3xl font-bold tracking-tight text-gradient">Satellite Monitoring</h1>
                        </div>
                        <p className="text-slate-400 text-sm">Earth observation & port conditions affecting critical logistics</p>
                    </div>
                    <GlassCard className="flex items-center gap-2 bg-cyan-500/10 px-4 py-2 border-cyan-500/20">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                        <span className="text-sm text-cyan-300 font-medium tracking-wider">NASA EONET LIVE</span>
                    </GlassCard>
                </div>
            </motion.header>

            {/* Port Weather Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <GlassCard className="p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Marine Port Conditions
                    </h2>

                    <div className="relative mb-6">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    placeholder="Search global port (e.g., Shanghai, Rotterdam)..."
                                    value={portSearch}
                                    onChange={(e) => setPortSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePortSearch()}
                                    className="pl-10 bg-slate-900/50 border-slate-700/50 text-slate-200 focus:ring-cyan-500/50 py-6"
                                />
                            </div>
                            <Button
                                onClick={() => handlePortSearch()}
                                disabled={portLoading}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20 px-8"
                            >
                                {portLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </div>
                                ) : (
                                    <>Search Registry</>
                                )}
                            </Button>
                        </div>

                        {portSuggestions.length > 0 && (
                            <GlassCard className="absolute z-30 w-full mt-2 bg-slate-900 border-slate-700 shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                {portSuggestions.map((port) => (
                                    <div
                                        key={port}
                                        onClick={() => selectPort(port)}
                                        className="px-4 py-3 hover:bg-cyan-500/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                    >
                                        <div className="font-semibold text-slate-200">{port}</div>
                                    </div>
                                ))}
                            </GlassCard>
                        )}
                    </div>

                    {portData && !portData.error && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <GlassCard className="p-4 border-slate-700/30 md:col-span-2">
                                <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2 font-bold">Location Analytics</div>
                                <div className="text-lg font-black text-slate-100 truncate">{portData.name}</div>
                                <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3 text-cyan-500" />
                                    {portData.location}
                                </div>
                            </GlassCard>
                            <GlassCard className="p-4 border-slate-700/30">
                                <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2 font-bold">Wave Height</div>
                                <div className="text-2xl font-black text-cyan-400">
                                    {portData.weather?.wave_height_m?.toFixed(1) || 0}m
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Swell Velocity Detected</div>
                            </GlassCard>
                            <GlassCard className={`p-4 border-slate-700/30 flex flex-col justify-between ${portData.status === "Optimal" ? "border-emerald-500/20 bg-emerald-500/5" :
                                    portData.status === "Rough" ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5"
                                }`}>
                                <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2 font-bold">Operational Status</div>
                                <div className={`text-[10px] font-black px-3 py-1 rounded-full border inline-block w-fit tracking-tighter ${portData.status === "Optimal" ? "text-emerald-400 border-emerald-500/30" :
                                        portData.status === "Rough" ? "text-amber-400 border-amber-500/30" :
                                            "text-red-400 border-red-500/30"
                                    }`}>
                                    {portData.status.toUpperCase()}
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </GlassCard>
            </motion.div>

            {/* Satellite Events */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <GlassCard className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-cyan-400" />
                            Global Hazard Events
                        </h2>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 tracking-tighter uppercase">
                            {events.length} SIGNALS DETECTED
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-slate-600">
                            <div className="relative w-16 h-16 mx-auto mb-6">
                                <Satellite className="w-16 h-16 animate-pulse opacity-50" />
                                <div className="absolute inset-0 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                            </div>
                            <p className="text-lg font-medium text-slate-400">Scanning Orbital Telemetry...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20 text-slate-600">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No active logistics-affecting events detected</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {events.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlassCard className="p-5 h-full hover:bg-white/5 transition-all group border-slate-800/30 flex flex-col">
                                        <div className="flex items-start justify-between mb-4 gap-2">
                                            <span className="text-[9px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 uppercase font-bold tracking-wider">
                                                {event.category}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(event.date).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-bold text-slate-200 line-clamp-2 mb-4 group-hover:text-cyan-300 transition-colors leading-relaxed">
                                            {event.title}
                                        </h3>

                                        <div className="space-y-2 mb-6 mt-auto">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                                                <span className="font-mono">
                                                    {event.location.coordinates[0].toFixed(2)}°, {event.location.coordinates[1].toFixed(2)}°
                                                </span>
                                            </div>
                                        </div>

                                        {event.link && (
                                            <a
                                                href={event.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-cyan-400 hover:text-cyan-300 group/link tracking-tighter uppercase"
                                            >
                                                <span>Analyze Source</span>
                                                <Search className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                            </a>
                                        )}
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default SatelliteMonitoring;
