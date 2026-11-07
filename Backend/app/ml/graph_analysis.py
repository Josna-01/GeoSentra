import networkx as nx
import pandas as pd
import os
from app.config import settings

class SupplyChainGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.lpi_data = None
        self.load_data()

    def load_data(self):
        lpi_path = os.path.join(settings.DATASET_DIR, "World_Bank_LPI.xlsx")
        if os.path.exists(lpi_path):
            try:
                # Load LPI data to use as node/edge weights
                self.lpi_data = pd.read_excel(lpi_path)
            except Exception as e:
                print(f"Error loading LPI data: {e}")
        
        # Initialize with dummy nodes if empty
        self._build_initial_graph()

    def _build_initial_graph(self):
        if self.lpi_data is not None:
            # Real coordinates for major logistics hubs
            COORDS = {
                'Germany': [51.1657, 10.4515],
                'Denmark': [56.2639, 9.5018],
                'Singapore': [1.3521, 103.8198],
                'Switzerland': [46.8182, 8.2275],
                'Netherlands': [52.1326, 5.2913],
                'Finland': [61.9241, 25.7482],
                'Austria': [47.5162, 14.5501],
                'Belgium': [50.5039, 4.4699],
                'Hong Kong SAR, China': [22.3193, 114.1694],
                'Sweden': [60.1282, 18.6435],
                'Canada': [56.1304, -106.3468],
                'United Arab Emirates': [23.4241, 53.8478],
                'France': [46.2276, 2.2137],
                'Korea, Rep.': [35.9078, 127.7669],
                'Luxembourg': [49.8153, 6.1296],
                'Norway': [60.4720, 8.4689],
                'Australia': [-25.2744, 133.7751],
                'United Kingdom': [55.3781, -3.4360],
                'United States': [37.0902, -95.7129],
                'Japan': [36.2048, 138.2529],
                'Spain': [40.4637, -3.7492],
                'Italy': [41.8719, 12.5674],
                'China': [35.8617, 104.1954],
                'India': [20.5937, 78.9629],
                'Brazil': [-14.2350, -51.9253],
                'Mexico': [23.6345, -102.5528],
                'South Africa': [-30.5595, 22.9375],
                'Poland': [51.9194, 19.1451],
                'Czech Republic': [49.8175, 15.4730],
                'Portugal': [39.3999, -8.2245],
                'Greece': [39.0742, 21.8243],
                'Turkey': [38.9637, 35.2433],
                'Russia': [61.5240, 105.3188],
                'Thailand': [15.8700, 100.9925],
                'Malaysia': [4.2105, 101.9758],
                'Indonesia': [-0.7893, 113.9213],
                'Vietnam': [14.0583, 108.2772],
                'Philippines': [12.8797, 121.7740],
                'Chile': [-35.6751, -71.5430],
                'Argentina': [-38.4161, -63.6167],
                'Colombia': [4.5709, -74.2973],
                'Peru': [-9.1900, -75.0152],
                'Egypt': [26.8206, 30.8025],
                'Saudi Arabia': [23.8859, 45.0792],
                'Israel': [31.0461, 34.8516],
                'New Zealand': [-40.9006, 174.8860],
            }

            # Load ALL economies from LPI data, not just top 20
            all_economies = self.lpi_data  # Use all rows instead of .head(20)
            print(f"Loading {len(all_economies)} economies from World Bank LPI dataset")
            
            for _, row in all_economies.iterrows():
                economy = row['Economy']
                score = row['LPI Score']
                self.graph.add_node(economy, 
                    type="Hub", 
                    lpi_score=float(score),
                    country=economy,
                    location=COORDS.get(economy, [0, 0]),
                    status="safe" if score > 3.4 else "warning" if score > 2.8 else "risk"
                )
            
            # Create some logical links between them (e.g., sequential)
            nodes = list(self.graph.nodes)
            for i in range(len(nodes) - 1):
                self.graph.add_edge(nodes[i], nodes[i+1], mode="Sea", time=float(25-i), cost=2000)
        else:
            # Fallback if no data
            self.graph.add_node("Global Hub", type="Hub", lpi_score=3.0, country="UN", status="safe")

    def get_critical_nodes(self):
        # Betweenness Centrality
        centrality = nx.betweenness_centrality(self.graph)
        return sorted(centrality.items(), key=lambda x: x[1], reverse=True)

    def find_alternative_paths(self, source, target, avoid_nodes=None):
        subgraph = self.graph.copy()
        if avoid_nodes:
            subgraph.remove_nodes_from([n for n in avoid_nodes if n in subgraph.nodes])
        
        try:
            paths = list(nx.shortest_simple_paths(subgraph, source, target, weight='time'))
            return paths[:3] # Top 3 paths
        except:
            return []

    def get_graph_data(self):
        # Format for frontend (nodes and links)
        nodes = []
        for n, d in self.graph.nodes(data=True):
            nodes.append({"id": n, **d})
        
        links = []
        for u, v, d in self.graph.edges(data=True):
            links.append({"source": u, "target": v, **d})
            
        return {"nodes": nodes, "links": links}

sc_graph = SupplyChainGraph()
