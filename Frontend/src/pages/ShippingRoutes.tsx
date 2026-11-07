import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ship, MapPin, Search } from "lucide-react";
import RiskMap, { Supplier, RoutePath } from "@/components/RiskMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Route extends RoutePath {
    avg_transit_time_days: number;
    status: string;
    vessels_in_transit: number;
}

interface Port {
    code: string;
    name: string;
    country: string;
    lat: number;
    lon: number;
}

const ShippingRoutes = () => {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [origin, setOrigin] = useState<string>("");
    const [destination, setDestination] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPorts();
    }, []);

    const fetchPorts = async () => {
        try {
            const res = await fetch("http://localhost:8000/shipping/ports");
            const data = await res.json();
            setPorts(data.ports || []);
        } catch (error) {
            console.error("Failed to fetch ports:", error);
        }
    };

    const handleSearch = async () => {
        if (!origin || !destination) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/shipping/search?origin=${origin}&destination=${destination}`);
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            setRoutes(data.routes || []);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "NORMAL": return "text-emerald-400 bg-emerald-950/30 border-emerald-900/50";
            case "DELAYED": return "text-amber-400 bg-amber-950/30 border-amber-900/50";
            case "CRITICAL": return "text-red-400 bg-red-950/30 border-red-900/50";
            default: return "text-slate-400 bg-slate-800/30 border-slate-700";
        }
    };

    // Prepare map markers (suppliers prop for RiskMap)
    const mapMarkers: Supplier[] = ports.map(port => ({
        id: port.code,
        name: `${port.name} Port`,
        location: [port.lat, port.lon] as [number, number],
        status: "safe", // Default safe as we removed congestion data for simplicity in search view
        riskLevel: 0,
        country: port.country,
        category: "Port"
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
                    <Ship className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-3xl font-bold tracking-tight">Shipping Routes</h1>
                </div>
                <p className="text-slate-400">Search and plan global maritime shipping routes</p>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Search */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="glass-card p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-cyan-400" />
                            Route Finder
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1.5 block">Origin Port</label>
                                <Select value={origin} onValueChange={setOrigin}>
                                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                                        <SelectValue placeholder="Select Origin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ports.map(port => (
                                            <SelectItem key={port.code} value={port.code}>{port.name}, {port.country}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 mb-1.5 block">Destination Port</label>
                                <Select value={destination} onValueChange={setDestination}>
                                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                                        <SelectValue placeholder="Select Destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ports.map(port => (
                                            <SelectItem key={port.code} value={port.code}>{port.name}, {port.country}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleSearch}
                                disabled={loading || !origin || !destination}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
                            >
                                {loading ? "Calculating..." : "Find Route"}
                            </Button>
                        </div>
                    </div>

                    {/* Route Details Results */}
                    <div className="space-y-4">
                        {routes.map((route, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-4 rounded-xl border border-slate-800 bg-slate-900/50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-200">{route.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(route.status)}`}>
                                        {route.status}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    {route.origin.name} → {route.destination.name}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-950/50 p-3 rounded-lg">
                                    <div>
                                        <div className="text-slate-500 text-xs">Est. Time</div>
                                        <div className="font-mono text-cyan-400">{route.avg_transit_time_days} days</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs">Vessels</div>
                                        <div className="font-mono text-slate-300">{route.vessels_in_transit}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Panel: Map */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 h-[600px] bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden relative"
                >
                    <RiskMap suppliers={mapMarkers} routes={routes} />

                    <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-0.5 bg-cyan-400"></div>
                            <span>Standard Route</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-amber-400 border-dashed border-b"></div>
                            <span>Alternative (Planned)</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ShippingRoutes;

