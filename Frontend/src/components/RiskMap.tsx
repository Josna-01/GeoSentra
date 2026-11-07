import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Types for supplier data
export interface Supplier {
  id: string;
  name: string;
  location: [number, number];
  status: "safe" | "warning" | "risk";
  riskLevel: number;
  country: string;
  category: string;
}

export interface RoutePath {
  id: string;
  name: string;
  origin: { name: string };
  destination: { name: string };
  path: { lat: number; lon: number }[];
  status: string;
}

interface RiskMapProps {
  suppliers?: Supplier[];
  routes?: RoutePath[];
  onSupplierSelect?: (supplier: Supplier) => void;
  selectedSupplier?: Supplier | null;
}

const getStatusColor = (status: Supplier["status"]) => {
  switch (status) {
    case "safe":
      return "#22c55e";
    case "warning":
      return "#eab308";
    case "risk":
      return "#ef4444";
  }
};

const RiskMap = ({ suppliers = [], routes = [], onSupplierSelect, selectedSupplier }: RiskMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const routesRef = useRef<L.Polyline[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [20, 10], // Slightly adjusted center
      zoom: 3,
      scrollWheelZoom: true,
      zoomControl: false, // Disable default
    });

    // Add manual zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update routes when routes prop changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing routes
    routesRef.current.forEach((route) => route.remove());
    routesRef.current = [];

    // Add new routes
    if (routes && routes.length > 0) {
      routes.forEach((route) => {
        // Convert route path objects {lat, lon} to Leaflet compatible array [lat, lon]
        const latLngs = route.path.map(p => [p.lat, p.lon] as [number, number]);

        const polyline = L.polyline(latLngs, {
          color: route.status === "NORMAL" ? "#22d3ee" : route.status === "DELAYED" ? "#f59e0b" : "#ef4444",
          weight: 2,
          opacity: 0.7,
          dashArray: route.status === "DELAYED" ? "5, 10" : undefined
        }).addTo(mapRef.current!);

        polyline.bindPopup(`
          <div class="p-2">
            <h4 class="font-semibold text-sm">${route.name}</h4>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-xs uppercase font-bold" style="color: ${route.status === "NORMAL" ? "#22d3ee" : "#f59e0b"}">${route.status}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">${route.origin.name} → ${route.destination.name}</p>
          </div>
        `);

        routesRef.current.push(polyline);
      });
    }
  }, [routes]);

  // Update markers when suppliers change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    suppliers.forEach((supplier) => {
      // Determine if this is a vessel or a supplier/port
      const isVessel = supplier.category === "Vessel";
      const color = getStatusColor(supplier.status);
      const isSelected = selectedSupplier?.id === supplier.id;

      const marker = L.circleMarker(supplier.location, {
        radius: isSelected ? 12 : (isVessel ? 4 : 8),
        fillColor: isVessel ? "#ffffff" : color,
        color: color,
        weight: isVessel ? 1 : 2,
        opacity: 1,
        fillOpacity: isVessel ? 0.9 : 0.8,
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div class="p-2">
          <h4 class="font-semibold text-sm">${supplier.name}</h4>
          <p class="text-xs text-gray-600">${supplier.country}</p>
          <div class="flex items-center gap-1 mt-1">
            <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
            <span class="text-xs capitalize">${supplier.status}</span>
          </div>
        </div>
      `);

      marker.on("click", () => {
        onSupplierSelect?.(supplier);
      });

      markersRef.current.push(marker);
    });
  }, [suppliers, selectedSupplier, onSupplierSelect]);

  // Fly to selected supplier
  useEffect(() => {
    if (mapRef.current && selectedSupplier) {
      mapRef.current.flyTo(selectedSupplier.location, mapRef.current.getZoom(), {
        duration: 1,
      });
    }
  }, [selectedSupplier]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ background: "#001f3f" }}
      />

      {/* Risk Legend */}
      <div className="absolute bottom-10 right-10 glass-card p-4 z-[1000] border border-white/10 shadow-2xl backdrop-blur-3xl bg-black/40">
        <p className="text-xs text-white/70 mb-2 font-medium">Risk Level</p>
        <div className="space-y-1.5">
          {[
            { status: "safe" as const, label: "Safe" },
            { status: "warning" as const, label: "Warning" },
            { status: "risk" as const, label: "High Risk" },
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(item.status) }}
              />
              <span className="text-xs text-white/80">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskMap;
