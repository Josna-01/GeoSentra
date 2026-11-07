import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen blue-mirage flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full md:pl-64 min-h-screen transition-all duration-300">
        <div className="h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default AppLayout;
