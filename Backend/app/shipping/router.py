from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Optional
from datetime import datetime
import networkx as nx
import math

router = APIRouter(prefix="/shipping", tags=["Shipping Routes"])

# --- Dynamic Sea Routing Engine ---

class MaritimeRouter:
    def __init__(self):
        self.graph = nx.Graph()
        self._build_network()
    
    def _build_network(self):
        # Major maritime nodes (waypoints)
        # Format: (lat, lon)
        nodes = {
            "Suez_North": (31.2, 32.3), "Suez_South": (29.9, 32.5),
            "Gibraltar": (35.9, -5.6), "Malacca": (2.5, 101.5),
            "Panama_East": (9.3, -79.9), "Panama_West": (8.9, -79.5),
            "Cape_Good_Hope": (-34.4, 18.5), "Horn": (-55.9, -67.2),
            "Sri_Lanka": (5.9, 80.5), "Singapore": (1.2, 103.8),
            "Tokyo": (35.6, 139.6), "Shanghai": (31.2, 121.5),
            "Hong_Kong": (22.3, 114.1), "Rotterdam": (51.9, 4.5),
            "Los_Angeles": (33.7, -118.2), "New_York": (40.7, -74.0),
            "Hamburg": (53.5, 9.9), "Dubai": (25.2, 55.3),
            "Santos": (-23.9, -46.3), "Mumbai": (18.9, 72.8),
            # Mid-ocean waypoints for better pathing
            "Atlantic_N": (45.0, -30.0), "Atlantic_Eq": (0.0, -25.0), "Atlantic_S": (-30.0, -15.0),
            "Indian_N": (10.0, 65.0), "Indian_S": (-20.0, 75.0),
            "Pacific_N": (40.0, -160.0), "Pacific_Eq": (0.0, -140.0), "Pacific_S": (-30.0, -130.0),
            "Med_Center": (35.0, 15.0), "Red_Sea_Center": (20.0, 38.0)
        }
        
        for name, coords in nodes.items():
            self.graph.add_node(name, pos=coords)
            
        # Define edges (sea lanes) with approximate distances (weight)
        edges = [
            ("Rotterdam", "Hamburg", 1), ("Rotterdam", "Atlantic_N", 4), ("Hamburg", "Atlantic_N", 4),
            ("Atlantic_N", "New_York", 6), ("New_York", "Atlantic_N", 6),
            ("Atlantic_N", "Gibraltar", 3), ("Gibraltar", "Med_Center", 3),
            ("Med_Center", "Suez_North", 3), ("Suez_North", "Suez_South", 0.5), # Canal
            ("Suez_South", "Red_Sea_Center", 2), ("Red_Sea_Center", "Indian_N", 4),
            ("Indian_N", "Dubai", 2), ("Indian_N", "Mumbai", 2),
            ("Indian_N", "Sri_Lanka", 2), ("Sri_Lanka", "Malacca", 3),
            ("Malacca", "Singapore", 0.5), ("Singapore", "Hong_Kong", 3),
            ("Hong_Kong", "Shanghai", 2), ("Shanghai", "Tokyo", 2),
            ("Tokyo", "Pacific_N", 6), ("Pacific_N", "Los_Angeles", 6),
            ("Los_Angeles", "Pacific_Eq", 5), ("Pacific_Eq", "Panama_West", 4),
            ("Panama_West", "Panama_East", 0.5), # Canal
            ("Panama_East", "Atlantic_Eq", 3), ("Atlantic_Eq", "Atlantic_N", 5),
            ("Atlantic_Eq", "Atlantic_S", 4), ("Atlantic_S", "Cape_Good_Hope", 4),
            ("Cape_Good_Hope", "Indian_S", 5), ("Indian_S", "Indian_N", 5),
            ("Indian_S", "Malacca", 5),
            ("Santos", "Atlantic_S", 3),
        ]
        
        for u, v, w in edges:
            self.graph.add_edge(u, v, weight=w)

    def find_route(self, origin_node: str, dest_node: str):
        try:
            path_nodes = nx.shortest_path(self.graph, origin_node, dest_node, weight="weight")
            
            # Construct coordinate path
            path_coords = []
            for node in path_nodes:
                lat, lon = self.graph.nodes[node]["pos"]
                path_coords.append({"lat": lat, "lon": lon})
                
            return {
                "origin": origin_node,
                "destination": dest_node,
                "path": path_coords,
                "distance_index": nx.path_weight(self.graph, path_nodes, weight="weight")
            }
        except Exception:
            return None
    
    def find_alternatives(self, origin_node: str, dest_node: str):
        try:
            # Find simple paths (limit to 3)
            paths = list(nx.isolve.k_shortest_paths(self.graph, origin_node, dest_node, k=3, weight="weight"))
            results = []
            for path_nodes in paths:
                coords = [{"lat": self.graph.nodes[n]["pos"][0], "lon": self.graph.nodes[n]["pos"][1]} for n in path_nodes]
                results.append({
                    "name": f"Via {path_nodes[len(path_nodes)//2]}",
                    "path": coords,
                    "nodes": path_nodes
                })
            return results
        except:
             # Fallback: simple shortest path
             route = self.find_route(origin_node, dest_node)
             return [route] if route else []

sea_router = MaritimeRouter()

# Expanded Port Database
PORTS_DB = [
    {"code": "CNSHA", "name": "Shanghai", "country": "China", "lat": 31.2304, "lon": 121.4737, "node": "Shanghai"},
    {"code": "SGSIN", "name": "Singapore", "country": "Singapore", "lat": 1.3521, "lon": 103.8198, "node": "Singapore"},
    {"code": "NLRTM", "name": "Rotterdam", "country": "Netherlands", "lat": 51.9225, "lon": 4.4792, "node": "Rotterdam"},
    {"code": "USLAX", "name": "Los Angeles", "country": "USA", "lat": 33.7701, "lon": -118.1937, "node": "Los_Angeles"},
    {"code": "USNYC", "name": "New York", "country": "USA", "lat": 40.6895, "lon": -74.0445, "node": "New_York"},
    {"code": "HKHKG", "name": "Hong Kong", "country": "Hong Kong", "lat": 22.3193, "lon": 114.1694, "node": "Hong_Kong"},
    {"code": "DEHAM", "name": "Hamburg", "country": "Germany", "lat": 53.5511, "lon": 9.9937, "node": "Hamburg"},
    {"code": "AEDXB", "name": "Dubai", "country": "UAE", "lat": 25.2048, "lon": 55.2708, "node": "Dubai"},
    {"code": "JPTYO", "name": "Tokyo", "country": "Japan", "lat": 35.6762, "lon": 139.6503, "node": "Tokyo"},
    {"code": "INBOM", "name": "Mumbai", "country": "India", "lat": 18.9401, "lon": 72.8347, "node": "Mumbai"},
    {"code": "BRSSZ", "name": "Santos", "country": "Brazil", "lat": -23.9608, "lon": -46.3331, "node": "Santos"},
]

@router.get("/ports")
def get_all_ports():
    return {"ports": PORTS_DB}

@router.get("/search")
def search_route(origin: str, destination: str):
    """
    Search for Sea Routes between two ports.
    Uses dynamic graph pathfinding to calculate route.
    Returns primary route and alternatives.
    """
    # 1. Resolve Ports
    origin_port = next((p for p in PORTS_DB if p["name"].lower() == origin.lower() or p["code"] == origin), None)
    dest_port = next((p for p in PORTS_DB if p["name"].lower() == destination.lower() or p["code"] == destination), None)
    
    if not origin_port or not dest_port:
        raise HTTPException(status_code=404, detail="One or both ports not found in database. Try: Shanghai, Rotterdam, New York, Singapore...")

    # 2. Calculate Routes
    try:
        # Find alternatives
        alternatives = sea_router.find_alternatives(origin_port["node"], dest_port["node"])
        
        if not alternatives:
             raise HTTPException(status_code=404, detail="No sea route found between these locations.")

        routes = []
        for idx, alt in enumerate(alternatives):
            routes.append({
                "id": alt.get("id", f"uniq_{idx}"),
                "name": alt.get("name", "Standard Route"),
                "origin": {"name": origin_port["name"], "lat": origin_port["lat"], "lon": origin_port["lon"]},
                "destination": {"name": dest_port["name"], "lat": dest_port["lat"], "lon": dest_port["lon"]},
                "path": alt["path"],
                "status": "NORMAL" if idx == 0 else "DELAYED", # Simulate primary as best, others as slower/delayed
                "delay_days": 0 if idx == 0 else 2.5,
                "congestion_level": "LOW" if idx == 0 else "MEDIUM",
                "vessels_in_transit": 12 - idx * 2,
                "avg_transit_time_days": int(alt.get("distance_index", 10) * 2.5) # approximate
            })

        return {
            "origin": origin_port,
            "destination": dest_port,
            "routes": routes
        }

    except Exception as e:
        print(f"Routing Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/vessels")
def get_vessels():
    # Return placeholder real-time vessels (simulated on graph edges)
    # Ideally integrated with AISHub, but for dynamic routing search, this is secondary
    return {"vessels": []}
