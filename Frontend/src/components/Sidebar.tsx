import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, List, Network, Satellite, MessageSquare, Database, FileText, Ship, TrendingUp } from "lucide-react";
import Logo from "./Logo";
import GlassCard from "./GlassCard";

const navItems = [
    { path: "/app", icon: Map, label: "Map Overview" },
    { path: "/app/events", icon: List, label: "Risk Events" },
    { path: "/app/suppliers", icon: Network, label: "Suppliers" },
    { path: "/app/satellite", icon: Satellite, label: "Satellite" },
    { path: "/app/social", icon: MessageSquare, label: "Social Listener" },
    { path: "/app/shipping", icon: Ship, label: "Shipping Routes" },
    { path: "/app/prediction", icon: TrendingUp, label: "Cost Prediction" },
    { path: "/app/erp", icon: Database, label: "ERP Integration" },
    { path: "/app/rfq", icon: FileText, label: "RFQ Management" },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-50 p-4">
            <GlassCard className="h-full flex flex-col p-4 bg-white/5">
                <div className="mb-8 pl-2">
                    <Logo />
                </div>

                <div className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="relative block"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarIndicator"
                                        className="absolute inset-0 bg-primary/20 rounded-lg border border-primary/30"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <div
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                            </NavLink>
                        );
                    })}
                </div>
            </GlassCard>
        </aside>
    );
};

export default Sidebar;
