import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, MapPin, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Supplier } from "./RiskMap";

import { useNavigate } from "react-router-dom";

interface SupplierDrawerProps {
  supplier: Supplier | null;
  onClose: () => void;
}

const SupplierDrawer = ({ supplier, onClose }: SupplierDrawerProps) => {
  const navigate = useNavigate();
  if (!supplier) return null;

  const getStatusInfo = (status: Supplier["status"]) => {
    switch (status) {
      case "safe":
        return { color: "bg-green-500", text: "Safe Zone", description: "No active threats detected" };
      case "warning":
        return { color: "bg-yellow-500", text: "Monitor", description: "Potential disruption signals" };
      case "risk":
        return { color: "bg-red-500", text: "High Risk", description: "Active threat to operations" };
    }
  };

  const statusInfo = getStatusInfo(supplier.status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[1001] glass-card rounded-t-3xl max-h-[60vh] overflow-hidden"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${statusInfo.color} animate-pulse`} />
            <div>
              <h3 className="text-lg font-semibold text-white">{supplier.name}</h3>
              <p className="text-sm text-white/60">{supplier.country}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 space-y-4 overflow-y-auto">
          {/* Status Card */}
          <div className="glass p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className={`w-5 h-5 ${supplier.status === "risk" ? "text-red-400" : supplier.status === "warning" ? "text-yellow-400" : "text-green-400"}`} />
              <span className="font-medium text-white">{statusInfo.text}</span>
            </div>
            <p className="text-sm text-white/70">{statusInfo.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-xs text-white/60">Location</span>
              </div>
              <p className="text-sm font-medium text-white">{supplier.country}</p>
            </div>
            <div className="glass p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-accent" />
                <span className="text-xs text-white/60">Category</span>
              </div>
              <p className="text-sm font-medium text-white">{supplier.category}</p>
            </div>
            <div className="glass p-3 rounded-xl col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-xs text-white/60">Risk Score</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${supplier.riskLevel}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-full ${supplier.riskLevel > 70 ? "bg-red-500" : supplier.riskLevel > 40 ? "bg-yellow-500" : "bg-green-500"}`}
                  />
                </div>
                <span className="text-sm font-mono font-medium text-white">{supplier.riskLevel}%</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="glass"
              className="flex-1"
              onClick={() => {
                navigate("/app/suppliers");
                onClose();
              }}
            >
              View Details
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => {
                navigate("/app/events");
                onClose();
              }}
            >
              Create Alert
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SupplierDrawer;
