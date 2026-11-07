from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import pandas as pd
import os

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

# --- LPI Data Integration ---
LPI_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "Dataset", "World_Bank_LPI.xlsx")
lpi_df = None

def load_lpi_data():
    global lpi_df
    try:
        # Read Excel - Assuming first sheet
        lpi_df = pd.read_excel(LPI_DATASET_PATH)
        print(f"✅ Loaded {len(lpi_df)} LPI records")
    except Exception as e:
        print(f"⚠️ Failed to load LPI dataset: {e}")
        lpi_df = None

load_lpi_data()

# Helper for ISO Codes and Exports
COUNTRY_META = {
    "Afghanistan": {"code": "af", "exports": "Opium, Fruits, Nuts, Carpets"},
    "Albania": {"code": "al", "exports": "Textiles, Chromium, Copper, Oil"},
    "Algeria": {"code": "dz", "exports": "Petroleum, Natural Gas, Electronics"},
    "Angola": {"code": "ao", "exports": "Crude Oil, Diamonds, Minerals, Coffee"},
    "Argentina": {"code": "ar", "exports": "Soybeans, Meat, Wheat, Vehicles"},
    "Australia": {"code": "au", "exports": "Iron Ore, Coal, Gold, Education"},
    "Austria": {"code": "at", "exports": "Machinery, Vehicles, Paper, Metal"},
    "Bangladesh": {"code": "bd", "exports": "Garments, Jute, Leather, Tea"},
    "Belgium": {"code": "be", "exports": "Chemicals, Machinery, Diamonds, Chocolate"},
    "Benin": {"code": "bj", "exports": "Cotton, Cashews, Textiles, Palm Oil"},
    "Bolivia": {"code": "bo", "exports": "Gas, Zinc, Silver, Soybeans"},
    "Bosnia and Herzegovina": {"code": "ba", "exports": "Metals, Electricity, Wood"},
    "Botswana": {"code": "bw", "exports": "Diamonds, Copper, Nickel, Beef"},
    "Brazil": {"code": "br", "exports": "Soybeans, Iron Ore, Oil, Coffee"},
    "Bulgaria": {"code": "bg", "exports": "Clothing, Fuels, Copper, Grain"},
    "Burkina Faso": {"code": "bf", "exports": "Gold, Cotton, Livestock, Sesame"},
    "Cambodia": {"code": "kh", "exports": "Clothing, Timber, Rubber, Rice"},
    "Cameroon": {"code": "cm", "exports": "Crude Oil, Cocoa, Coffee, Cotton"},
    "Canada": {"code": "ca", "exports": "Energy, Automotive, Minerals, Wood"},
    "Chile": {"code": "cl", "exports": "Copper, Fruit, Fish, Wine"},
    "China": {"code": "cn", "exports": "Electronics, Machinery, Textiles"},
    "Colombia": {"code": "co", "exports": "Oil, Coal, Coffee, Emeralds"},
    "Costa Rica": {"code": "cr", "exports": "Medical Instruments, Bananas, Coffee"},
    "Cote d'Ivoire": {"code": "ci", "exports": "Cocoa, Coffee, Oil, Cotton"},
    "Croatia": {"code": "hr", "exports": "Transport Equipment, Textiles, Food"},
    "Cyprus": {"code": "cy", "exports": "Pharmaceuticals, Citrus, Cement"},
    "Czech Republic": {"code": "cz", "exports": "Cars, Machinery, Electronics"},
    "Denmark": {"code": "dk", "exports": "Wind Turbines, Pharmaceuticals, Machinery"},
    "Dominican Republic": {"code": "do", "exports": "Medical Instruments, Tobacco, Apparel"},
    "Ecuador": {"code": "ec", "exports": "Oil, Bananas, Shrimp, Flowers"},
    "Egypt": {"code": "eg", "exports": "Oil, Textiles, Cotton, Chemicals"},
    "El Salvador": {"code": "sv", "exports": "Textiles, Coffee, Sugar, Chemicals"},
    "Estonia": {"code": "ee", "exports": "Machinery, Wood, Textiles, Electronics"},
    "Ethiopia": {"code": "et", "exports": "Coffee, Gold, Leather, Oilseeds"},
    "Finland": {"code": "fi", "exports": "Paper, Machinery, Tech, Chemicals"},
    "France": {"code": "fr", "exports": "Aerospace, Luxury Goods, Wine, Pharma"},
    "Gabon": {"code": "ga", "exports": "Oil, Manganese, Timber, Uranium"},
    "Gambia": {"code": "gm", "exports": "Peanuts, Fish, Cotton, Hides"},
    "Georgia": {"code": "ge", "exports": "Cars, Copper, Wine, Ferroalloys"},
    "Germany": {"code": "de", "exports": "Automotive, Machinery, Chemicals"},
    "Ghana": {"code": "gh", "exports": "Gold, Cocoa, Oil, Timber"},
    "Greece": {"code": "gr", "exports": "Refined Petroleum, Medikaments, Fish"},
    "Guatemala": {"code": "gt", "exports": "Coffee, Sugar, Bananas, Clothing"},
    "Guinea": {"code": "gn", "exports": "Bauxite, Gold, Diamonds, Coffee"},
    "Guinea-Bissau": {"code": "gw", "exports": "Cashews, Fish, Timber, Peanuts"},
    "Haiti": {"code": "ht", "exports": "Apparel, Oil, Mangoes, Coffee"},
    "Honduras": {"code": "hn", "exports": "Apparel, Coffee, Wiring, Seafood"},
    "Hong Kong": {"code": "hk", "exports": "Gold, Electronics, Jewelry"},
    "Hungary": {"code": "hu", "exports": "Cars, Electronics, Pharmaceutics"},
    "India": {"code": "in", "exports": "Pharmaceuticals, Textiles, IT Services"},
    "Indonesia": {"code": "id", "exports": "Coal, Palm Oil, Rubber, Textiles"},
    "Iran": {"code": "ir", "exports": "Oil, Plastics, Fruits, Nuts"},
    "Iraq": {"code": "iq", "exports": "Crude Oil, Gold, Dates"},
    "Ireland": {"code": "ie", "exports": "Pharmaceuticals, Chemicals, Tech"},
    "Israel": {"code": "il", "exports": "Diamonds, Tech, Pharmaceuticals"},
    "Italy": {"code": "it", "exports": "Machinery, Fashion, Vehicles"},
    "Jamaica": {"code": "jm", "exports": "Alumina, Bauxite, Sugar, Rum"},
    "Japan": {"code": "jp", "exports": "Vehicles, Robotics, Advanced Materials"},
    "Jordan": {"code": "jo", "exports": "Textiles, Phosphates, Potash"},
    "Kazakhstan": {"code": "kz", "exports": "Oil, Copper, Uranium, Wheat"},
    "Kenya": {"code": "ke", "exports": "Tea, Flowers, Coffee, Petroleum"},
    "Kuwait": {"code": "kw", "exports": "Oil, Petrochemicals, Fertilizer"},
    "Kyrgyz Republic": {"code": "kg", "exports": "Gold, Mercury, Textiles"},
    "Laos": {"code": "la", "exports": "Copper, Electricity, Timber"},
    "Latvia": {"code": "lv", "exports": "Wood, Machinery, Textiles"},
    "Lebanon": {"code": "lb", "exports": "Jewelry, Chemicals, Fruits"},
    "Lesotho": {"code": "ls", "exports": "Diamonds, Water, Clothing"},
    "Liberia": {"code": "lr", "exports": "Rubber, Iron Ore, Timber, Gold"},
    "Libya": {"code": "ly", "exports": "Crude Oil, Natural Gas, Chemicals"},
    "Lithuania": {"code": "lt", "exports": "Refined Petroleum, Furniture, Wheat"},
    "Luxembourg": {"code": "lu", "exports": "Financial Services, Steel"},
    "Madagascar": {"code": "mg", "exports": "Vanilla, Nickel, Cloves, Textiles"},
    "Malawi": {"code": "mw", "exports": "Tobacco, Tea, Sugar, Cotton"},
    "Malaysia": {"code": "my", "exports": "Electronics, Palm Oil, Gas, Rubber"},
    "Maldives": {"code": "mv", "exports": "Fish, Tourism Services"},
    "Mali": {"code": "ml", "exports": "Gold, Cotton, Livestock"},
    "Malta": {"code": "mt", "exports": "Machinery, Fish, Pharma, Electronics"},
    "Mauritania": {"code": "mr", "exports": "Iron Ore, Fish, Gold, Copper"},
    "Mauritius": {"code": "mu", "exports": "Textiles, Sugar, Fish"},
    "Mexico": {"code": "mx", "exports": "Automotive, Electronics, Oil, Produce"},
    "Moldova": {"code": "md", "exports": "Wine, Grain, Fruits, Machinery"},
    "Mongolia": {"code": "mn", "exports": "Coal, Copper, Cashmere"},
    "Montenegro": {"code": "me", "exports": "Aluminum, Electricity, Wine"},
    "Morocco": {"code": "ma", "exports": "Phosphates, Cars, Clothing, Produce"},
    "Mozambique": {"code": "mz", "exports": "Coal, Aluminum, Gas, Tobacco"},
    "Myanmar": {"code": "mm", "exports": "Gas, Garments, Rice, Copper"},
    "Namibia": {"code": "na", "exports": "Diamonds, Uranium, Fish, Beef"},
    "Nepal": {"code": "np", "exports": "Carpets, Textiles, Tea, Spices"},
    "Netherlands": {"code": "nl", "exports": "Machinery, Chemicals, Food, Tech"},
    "New Zealand": {"code": "nz", "exports": "Dairy, Meat, Wood, Fruit"},
    "Nicaragua": {"code": "ni", "exports": "Apparel, Coffee, Beef, Sugar"},
    "Niger": {"code": "ne", "exports": "Uranium, Livestock, Cowpeas"},
    "Nigeria": {"code": "ng", "exports": "Crude Oil, Gas, Cocoa"},
    "North Macedonia": {"code": "mk", "exports": "Chemicals, Textiles, Steel"},
    "Norway": {"code": "no", "exports": "Oil, Gas, Fish, Aluminum"},
    "Oman": {"code": "om", "exports": "Oil, Fish, Metals, Textiles"},
    "Pakistan": {"code": "pk", "exports": "Textiles, Rice, Leather, Cotton"},
    "Panama": {"code": "pa", "exports": "Bananas, Shrimp, Coffee, Sugar"},
    "Papua New Guinea": {"code": "pg", "exports": "Gas, Gold, Copper, Oil"},
    "Paraguay": {"code": "py", "exports": "Soybeans, Electricity, Meat"},
    "Peru": {"code": "pe", "exports": "Copper, Gold, Fishmeal, Zinc"},
    "Philippines": {"code": "ph", "exports": "Electronics, Machinery, Fruits"},
    "Poland": {"code": "pl", "exports": "Machinery, Furniture, Foods"},
    "Portugal": {"code": "pt", "exports": "Cars, Textiles, Shoes, Cork"},
    "Qatar": {"code": "qa", "exports": "LNG, Oil, Petrochemicals"},
    "Romania": {"code": "ro", "exports": "Machinery, Cars, Metals, Textiles"},
    "Russia": {"code": "ru", "exports": "Oil, Gas, Coal, Metals"},
    "Rwanda": {"code": "rw", "exports": "Coffee, Tea, Tin, Coltan"},
    "Saudi Arabia": {"code": "sa", "exports": "Oil, Polymers, Chemicals"},
    "Senegal": {"code": "sn", "exports": "Fish, Groundnuts, Phosphates"},
    "Serbia": {"code": "rs", "exports": "Cars, Electrical, Rubber, Corn"},
    "Sierra Leone": {"code": "sl", "exports": "Iron Ore, Diamonds, Rutile"},
    "Singapore": {"code": "sg", "exports": "Electronics, Petroleum, Chemicals"},
    "Slovak Republic": {"code": "sk", "exports": "Cars, Electronics, Steel"},
    "Slovenia": {"code": "si", "exports": "Pharma, Cars, Electricity"},
    "Solomon Islands": {"code": "sb", "exports": "Timber, Palm Oil, Fish"},
    "Somalia": {"code": "so", "exports": "Livestock, Bananas, Hides"},
    "South Africa": {"code": "za", "exports": "Platinum, Gold, Cars, Iron"},
    "Spain": {"code": "es", "exports": "Cars, Food, Pharma, Machinery"},
    "Sri Lanka": {"code": "lk", "exports": "Textiles, Tea, Rubber, Gems"},
    "Sudan": {"code": "sd", "exports": "Gold, Oil, Gum Arabic"},
    "Sweden": {"code": "se", "exports": "Machinery, Cars, Paper, Iron"},
    "Switzerland": {"code": "ch", "exports": "Pharma, Gold, Watches, Machinery"},
    "Syrian Arab Republic": {"code": "sy", "exports": "Oil, Minerals, Fruits"},
    "Taiwan": {"code": "tw", "exports": "Semiconductors, Electronics"},
    "Tajikistan": {"code": "tj", "exports": "Aluminum, Cotton, Electricity"},
    "Tanzania": {"code": "tz", "exports": "Gold, Coffee, Cashews, Cotton"},
    "Thailand": {"code": "th", "exports": "Cars, Electronics, Rice, Rubber"},
    "Timor-Leste": {"code": "tl", "exports": "Oil, Gas, Coffee"},
    "Togo": {"code": "tg", "exports": "Phospates, Cotton, Coffee"},
    "Trinidad and Tobago": {"code": "tt", "exports": "Gas, Ammonia, Methanol"},
    "Tunisia": {"code": "tn", "exports": "Apparel, Machinery, Phosphates"},
    "Turkey": {"code": "tr", "exports": "Cars, Apparel, Steel, Crops"},
    "Turkiye": {"code": "tr", "exports": "Cars, Apparel, Steel, Crops"}, # Handle alt name
    "Turkmenistan": {"code": "tm", "exports": "Gas, Oil, Cotton"},
    "Uganda": {"code": "ug", "exports": "Coffee, Fish, Tea, Gold"},
    "Ukraine": {"code": "ua", "exports": "Grain, Steel, Iron, Fat"},
    "United Arab Emirates": {"code": "ae", "exports": "Oil, Aluminum, Jewelry"},
    "United Kingdom": {"code": "gb", "exports": "Machinery, Cars, Pharma, Finance"},
    "United States": {"code": "us", "exports": "Semiconductors, Aerospace, Pharma"},
    "Uruguay": {"code": "uy", "exports": "Beef, Soybeans, Cellulose"},
    "Uzbekistan": {"code": "uz", "exports": "Gold, Cotton, Gas"},
    "Venezuela": {"code": "ve", "exports": "Oil, Gold, Chemicals"},
    "Vietnam": {"code": "vn", "exports": "Electronics, Footwear, Textiles"},
    "Yemen": {"code": "ye", "exports": "Oil, Fish"},
    "Armenia": {"code": "am", "exports": "Copper, Gold, Tobacco, Spirits"},
    "Azerbaijan": {"code": "az", "exports": "Oil, Gas, Chemicals, Fruits"},
    "Bahrain": {"code": "bh", "exports": "Aluminum, Oil, Refined Petroleum"},
    "Belarus": {"code": "by", "exports": "Machinery, Chemicals, Fertilizers"},
    "Belize": {"code": "bz", "exports": "Sugar, Bananas, Seafood, Juice"},
    "Bhutan": {"code": "bt", "exports": "Electricity, Ferrosilicon, Cement"},
    "Brunei": {"code": "bn", "exports": "Oil, Natural Gas, Chemicals"},
    "Burundi": {"code": "bi", "exports": "Coffee, Tea, Sugar, Gold"},
    "Cabo Verde": {"code": "cv", "exports": "Fish, Apparel, Shoes, Fuel"},
    "Central African Republic": {"code": "cf", "exports": "Diamonds, Timber, Cotton"},
    "Chad": {"code": "td", "exports": "Crude Oil, Livestock, Cotton"},
    "Comoros": {"code": "km", "exports": "Vanilla, Cloves, Ylang-ylang"},
    "Congo, Dem. Rep.": {"code": "cd", "exports": "Copper, Cobalt, Diamonds, Tantalum"},
    "Congo, Rep.": {"code": "cg", "exports": "Crude Oil, Timber, Diamonds"},
    "Djibouti": {"code": "dj", "exports": "Re-exports, Hides, Skins, Coffee"},
    "Dominica": {"code": "dm", "exports": "Bananas, Soap, Bay Oil, Cocoa"},
    "Equatorial Guinea": {"code": "gq", "exports": "Petroleum, Natural Gas, Timber"},
    "Eritrea": {"code": "er", "exports": "Gold, Zinc, Copper, Livestock"},
    "Eswatini": {"code": "sz", "exports": "Sugar, Wood, Concentrates"},
    "Fiji": {"code": "fj", "exports": "Sugar, Fish, Wood, Gold"},
    "Guadeloupe": {"code": "gp", "exports": "Bananas, Sugar, Rum"},
    "Guyana": {"code": "gy", "exports": "Sugar, Gold, Rice, Bauxite"},
    "Iceland": {"code": "is", "exports": "Fish, Aluminum, Energy"},
    "Korea, Rep.": {"code": "kr", "exports": "Semiconductors, Ships, Cars"},
    "Lao PDR": {"code": "la", "exports": "Copper, Electricity, Timber"},
    "Liberia": {"code": "lr", "exports": "Rubber, Iron Ore, Timber"},
    "Libya": {"code": "ly", "exports": "Oil, Gas, Chemicals"},
    "Madagascar": {"code": "mg", "exports": "Vanilla, Nickel, Cloves"},
    "Malawi": {"code": "mw", "exports": "Tobacco, Tea, Sugar"},
    "Nepal": {"code": "np", "exports": "Textiles, Tea, Spices"},
    "Niger": {"code": "ne", "exports": "Uranium, Livestock, Cowpeas"},
    "Paraguay": {"code": "py", "exports": "Soybeans, Electricity, Meat"},
    "Peru": {"code": "pe", "exports": "Copper, Gold, Fishmeal"},
    "Papua New Guinea": {"code": "pg", "exports": "Gas, Gold, Copper"},
    "Qatar": {"code": "qa", "exports": "LNG, Oil, Petrochemicals"},
    "Suriname": {"code": "sr", "exports": "Gold, Oil, Bauxite, Rice"},
    "Togo": {"code": "tg", "exports": "Phosphates, Cotton, Coffee"},
    "Turkmenistan": {"code": "tm", "exports": "Natural Gas, Oil, Cotton"},
    "Uzbekistan": {"code": "uz", "exports": "Gold, Cotton, Gas"},
    "Venezuela, RB": {"code": "ve", "exports": "Oil, Gold, Chemicals"},
    "Yemen, Rep.": {"code": "ye", "exports": "Crude Oil, Fish, Coffee"},
    "Zambia": {"code": "zm", "exports": "Copper, Cobalt, Gold"},
    "Zimbabwe": {"code": "zw", "exports": "Platinum, Gold, Tobacco"},
    "South Sudan": {"code": "ss", "exports": "Crude Oil, Gold, Silver"},
    "Solomon Islands": {"code": "sb", "exports": "Timber, Fish, Palm Oil"},
}

def get_country_meta(name: str) -> Dict[str, str]:
    # Match fuzzy or by checking keys
    normalized = name.strip()
    
    # Try exact match
    if normalized in COUNTRY_META:
        return COUNTRY_META[normalized]
    
    # Try fuzzy match (if normalized starts with the key, or key in normalized)
    # e.g. "Korea, Rep." matches "Korea" mapping if it existed, but here I added mapped versions
    for key, val in COUNTRY_META.items():
        if key in normalized or normalized in key:
            return val
            
    # Simple Fallback
    return {"code": "un", "exports": "Global Commodities & Critical Goods"}

@router.get("/list")
def get_lpi_countries():
    """Get list of countries from LPI dataset (139 countries) with enriched metadata"""
    if lpi_df is None:
        raise HTTPException(status_code=500, detail="LPI dataset not available")
    
    countries = []
    
    # Iterate LPI rows
    for _, row in lpi_df.iterrows():
        name = str(row.get("Economy", "Unknown"))
        if name == "nan": continue
        
        meta = get_country_meta(name)
        code = meta["code"]
        
        lpi_score = row.get("LPI Score", 0)
        # Handle nan
        if pd.isna(lpi_score): lpi_score = 2.5
        
        countries.append({
            "id": f"cnt_{code}_{_}",
            "name": name,
            "country": name,
            "iso_code": code,
            "flag_url": f"https://flagcdn.com/w320/{code}.png",
            "main_exports": meta["exports"],
            "lpi_score": round(float(lpi_score), 2),
            "lpi_rank": int(row.get("LPI Rank", 0)) if not pd.isna(row.get("LPI Rank", 0)) else 0,
            "risk_score": round((5.0 - float(lpi_score)) * 20, 1), # Invert LPI (5 is best) to Risk (100 is high risk)
            "category": "National Logistics Node",
            "status": "active"
        })
    
    return {"total": len(countries), "countries": countries}

class SupplierContact(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    company: str
    country: str
    category: str
    status: str = "active"
    last_contacted: Optional[str] = None
    notes: Optional[str] = None

# In-memory storage (would be database in production)
SUPPLIER_CONTACTS = [
    {
        "id": "sup_001",
        "name": "Li Wei",
        "email": "li.wei@shanghai-logistics.cn",
        "phone": "+86 21 5555 1234",
        "company": "Shanghai Logistics Hub",
        "country": "China",
        "category": "Logistics",
        "status": "active",
        "last_contacted": None,
        "notes": "Primary contact for East Asia shipping"
    },
    {
        "id": "sup_002",
        "name": "Hans Mueller",
        "email": "h.mueller@hamburg-port.de",
        "phone": "+49 40 1234 5678",
        "company": "Hamburg Port Authority",
        "country": "Germany",
        "category": "Port Operations",
        "status": "active",
        "last_contacted": None,
        "notes": "European distribution hub contact"
    },
    {
        "id": "sup_003",
        "name": "Maria Santos",
        "email": "m.santos@rotterdam-freight.nl",
        "phone": "+31 10 987 6543",
        "company": "Rotterdam Freight Services",
        "country": "Netherlands",
        "category": "Freight",
        "status": "active",
        "last_contacted": None,
        "notes": "Backup route for European deliveries"
    }
]

@router.get("/contacts")
def get_supplier_contacts():
    """Get all supplier contacts"""
    return SUPPLIER_CONTACTS

@router.post("/contacts/{contact_id}/notify")
def notify_supplier(contact_id: str, message: str):
    """Send notification to supplier (simulated)"""
    contact = next((c for c in SUPPLIER_CONTACTS if c["id"] == contact_id), None)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Update last contacted time
    contact["last_contacted"] = datetime.utcnow().isoformat()
    
    return {
        "status": "sent",
        "contact": contact["name"],
        "email": contact["email"],
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/contacts/{contact_id}")
def get_contact(contact_id: str):
    """Get specific supplier contact"""
    contact = next((c for c in SUPPLIER_CONTACTS if c["id"] == contact_id), None)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact
