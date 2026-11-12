import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Supplier } from "@/components/RiskMap";
import { TrendingUp, AlertTriangle, Anchor } from "lucide-react";
import { toast } from "sonner";

export interface RiskEvent {
    id: string | number;
    event_type: "Strike" | "Conflict" | "Sanction" | "Disaster";
    summary: string;
    severity_score?: number;
    source?: "USGS";
    source_url?: string;
    magnitude?: number;
    impact_cost?: number;
    location: {
        city: string;
        country: string;
        coordinates: [number, number];
    };
    predicted_days?: number;
    timestamp: string;
}

interface UsgsStatus {
    status: "starting" | "current" | "stale" | "unavailable";
    last_success_at: string | null;
}

interface RiskContextType {
    suppliers: Supplier[];
    setSuppliers: (suppliers: Supplier[]) => void;
    events: RiskEvent[];
    usgsStatus: UsgsStatus | null;
    isLoading: boolean;
    simulateCrisis: (text: string) => Promise<void>;
    fetchData: () => Promise<void>;
}

const RiskContext = createContext<RiskContextType | undefined>(undefined);

const API_BASE = "http://localhost:8000/risk";

export const RiskProvider = ({ children }: { children: ReactNode }) => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [events, setEvents] = useState<RiskEvent[]>([]);
    const [usgsStatus, setUsgsStatus] = useState<UsgsStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Graph (Suppliers)
            const graphRes = await fetch(`${API_BASE}/graph`);
            const graphData = await graphRes.json();

            const suppliersList: Supplier[] = graphData.nodes
                .map((n: any) => ({
                    id: n.id,
                    name: n.name || n.id,
                    // Map hubs to some global coordinates for visualization
                    location: n.location || [
                        Math.sin(n.id.length) * 40, // Deterministic "random" for demo if not provided
                        Math.cos(n.id.length) * 80
                    ],
                    status: n.status || "safe",
                    riskLevel: n.lpi_score ? (5 - n.lpi_score) * 20 : 20, // Inverse LPI for risk
                    country: n.country || "Global",
                    category: n.type || "Hub"
                }));

            setSuppliers(suppliersList);

            // Fetch Alerts
            const alertsRes = await fetch(`${API_BASE}/alerts`);
            const alertsData = await alertsRes.json();
            setEvents(alertsData);
        } catch (error) {
            console.error("Failed to fetch risk data:", error);
            toast.error("Failed to connect to backend");
        } finally {
            setIsLoading(false);
        }
    };

    const simulateCrisis = async (text: string) => {
        try {
            const res = await fetch(`${API_BASE}/simulate?event_text=${encodeURIComponent(text)}`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Simulation failed");
            const newEvent = await res.json();
            setEvents(prev => [newEvent, ...prev]);
            toast.success("Crisis simulated successfully!");

            // Re-fetch with a slight delay to allow Firestore indexing
            setTimeout(() => {
                fetchData();
            }, 1500);
        } catch (error) {
            console.error("Simulation error:", error);
            toast.error("Simulation failed. Check console.");
        }
    };

    useEffect(() => {
        fetchData();

        // Poll for updates every 10 seconds
        const pollInterval = setInterval(fetchData, 10000);

        const fetchUsgsStatus = async () => {
            try {
                const response = await fetch(`${API_BASE}/feeds/usgs`);
                if (!response.ok) throw new Error("USGS status unavailable");
                setUsgsStatus(await response.json());
            } catch {
                setUsgsStatus(previous => ({
                    status: "unavailable",
                    last_success_at: previous?.last_success_at ?? null,
                }));
            }
        };

        fetchUsgsStatus();
        const statusInterval = setInterval(fetchUsgsStatus, 10000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(statusInterval);
        };
    }, []);

    return (
        <RiskContext.Provider value={{ suppliers, setSuppliers, events, usgsStatus, isLoading, simulateCrisis, fetchData }}>
            {children}
        </RiskContext.Provider>
    );
};

export const useRiskData = () => {
    const context = useContext(RiskContext);
    if (context === undefined) {
        throw new Error("useRiskData must be used within a RiskProvider");
    }
    return context;
};
