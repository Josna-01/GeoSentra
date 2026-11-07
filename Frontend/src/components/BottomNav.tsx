import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, List, Network, User } from "lucide-react";

const navItems = [
  { path: "/app", icon: Map, label: "Map" },
  { path: "/app/events", icon: List, label: "Events" },
  { path: "/app/suppliers", icon: Network, label: "Suppliers" },
  { path: "/app/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={`transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-white/50"
                }`}
              />
              <span
                className={`text-[10px] mt-1 transition-colors duration-200 ${
                  isActive ? "text-primary font-medium" : "text-white/50"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
