import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Network, ArrowUpRight, ShieldAlert, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";

interface CountrySupplier {
  id: string;
  name: string;
  iso_code: string;
  flag_url: string;
  main_exports: string;
  lpi_score: number;
  lpi_rank: number;
  risk_score: number;
  status: string;
}

const Suppliers = () => {
  const [countries, setCountries] = useState<CountrySupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("http://localhost:8000/suppliers/list");
      const data = await res.json();
      setCountries(data.countries || []);
    } catch (error) {
      console.error("Failed to fetch supplier countries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.main_exports.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (score: number) => {
    if (score >= 60) return "text-red-400";
    if (score >= 40) return "text-amber-400";
    return "text-emerald-400";
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
          <Network className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight">Global Logistics Network</h1>
        </div>
        <p className="text-slate-400">Monitoring {countries.length} national logistics nodes based on World Bank LPI Data</p>
      </motion.header>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 max-w-md relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search by country or export (e.g., Electronics, Gold)..."
          className="pl-10 bg-slate-900 border-slate-700 text-slate-200 focus:ring-cyan-500/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-600">
            Loading logistics network data...
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-600">
            No countries found matching your search.
          </div>
        ) : (
          filteredCountries.map((country, index) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-0 overflow-hidden group h-full hover:border-cyan-500/30 transition-all duration-300">
                {/* Flag Header */}
                <div className="h-24 bg-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
                  <img
                    src={country.flag_url}
                    alt={`${country.name} flag`}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white shadow-black drop-shadow-md">{country.name}</h3>
                  </div>
                  <div className="absolute top-3 right-3 z-20 bg-slate-950/80 px-2 py-1 rounded text-xs font-mono text-slate-300 border border-slate-800">
                    #{country.lpi_rank}
                  </div>
                </div>

                <div className="p-5">
                  {/* Logistics Score */}
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Logistics Score (LPI)</div>
                      <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                        {country.lpi_score}
                        <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Risk Score</div>
                      <div className={`text-xl font-bold ${getRiskColor(country.risk_score)}`}>
                        {country.risk_score}
                      </div>
                    </div>
                  </div>

                  {/* Key Exports */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 text-sm text-cyan-400 font-medium">
                      <ArrowUpRight className="w-4 h-4" />
                      Key Exports
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                      {country.main_exports}
                    </p>
                  </div>

                  {/* Status Footer */}
                  <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-xs">
                    <span className="text-slate-500 uppercase tracking-wider">Status</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/30 border border-emerald-900/50 text-emerald-400">
                      <BadgeCheck className="w-3 h-3" />
                      <span>Active Node</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Suppliers;

