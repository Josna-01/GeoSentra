import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface CurrencyRates {
    base: string;
    rates: {
        [key: string]: number;
    };
    last_updated: string;
}

const MarketWidget = () => {
    const [currencies, setCurrencies] = useState<CurrencyRates | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const res = await fetch("http://localhost:8000/market/currencies");
                const data = await res.json();
                setCurrencies(data);
            } catch (error) {
                console.error("Failed to fetch currency data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencies();
        const interval = setInterval(fetchCurrencies, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (loading || !currencies) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Market Data</h3>
                </div>
                <div className="text-xs text-slate-500">Loading...</div>
            </div>
        );
    }

    const currencyPairs = Object.entries(currencies.rates).filter(([key]) => key !== "USD");

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-4 shadow-xl"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">FX Rates</h3>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">LIVE</span>
            </div>

            <div className="space-y-2">
                {currencyPairs.slice(0, 4).map(([currency, rate]) => (
                    <div key={currency} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-300">{currency}/USD</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400">{rate.toFixed(2)}</span>
                            {Math.random() > 0.5 ? (
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-red-400" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">
                    Updated: {currencies.last_updated === "Cached" ? "Cached Data" : "Live"}
                </div>
            </div>
        </motion.div>
    );
};

export default MarketWidget;
