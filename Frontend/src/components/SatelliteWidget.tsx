import { useEffect, useState } from "react";
import { Satellite, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface SatelliteEvent {
    id: string;
    title: string;
    category: string;
    location: {
        coordinates: [number, number];
    };
    date: string;
    source: string;
}

const SatelliteWidget = () => {
    const [events, setEvents] = useState<SatelliteEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("http://localhost:8000/satellite/events?limit=5");
                const data = await res.json();
                setEvents(data.events || []);
            } catch (error) {
                console.error("Failed to fetch satellite events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                    <Satellite className="w-4 h-4 text-purple-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Satellite Monitor</h3>
                </div>
                <div className="text-xs text-slate-500">Loading...</div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-4 shadow-xl min-w-[320px]"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Earth Events</h3>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">NASA EONET</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {events.length === 0 ? (
                    <div className="text-center py-4 text-slate-600">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No active events</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-1">
                                <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                                    {event.title}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-purple-950/50 text-purple-400 rounded uppercase font-bold">
                                    {event.category}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                                {new Date(event.date).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">
                    Source: NASA Earth Observatory
                </div>
            </div>
        </motion.div>
    );
};

export default SatelliteWidget;
