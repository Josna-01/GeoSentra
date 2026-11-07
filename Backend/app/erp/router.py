from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
import pandas as pd
import json
from datetime import datetime
import io

router = APIRouter(prefix="/erp", tags=["ERP Integration"])

# In-memory storage (replace with database in production)
SUPPLIERS_DB = {}

@router.post("/import-suppliers")
async def import_suppliers_from_erp(file: UploadFile = File(...)):
    """
    Import supplier data from ERP system (CSV/Excel format)
    
    Expected columns:
    - supplier_id: Unique identifier
    - supplier_name: Company name
    - country: Location
    - category: Product/service category
    - lead_time_days: Average lead time
    - contract_value: Annual contract value
    - risk_tier: Low/Medium/High
    - contact_email: Procurement contact
    """
    try:
        # Read file content
        contents = await file.read()
        
        # Read file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or Excel.")
        
        # Validate required columns
        required_cols = ['supplier_id', 'supplier_name', 'country']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_cols)}"
            )
        
        # Process and store suppliers
        suppliers_added = 0
        suppliers_updated = 0
        
        for _, row in df.iterrows():
            supplier_id = str(row['supplier_id'])
            supplier_data = {
                "supplier_id": supplier_id,
                "name": str(row['supplier_name']),
                "country": str(row['country']),
                "category": str(row.get('category', 'General')),
                "lead_time_days": int(row.get('lead_time_days', 30)) if pd.notna(row.get('lead_time_days')) else 30,
                "contract_value": float(row.get('contract_value', 0)) if pd.notna(row.get('contract_value')) else 0,
                "risk_tier": str(row.get('risk_tier', 'Medium')),
                "contact_email": str(row.get('contact_email', '')),
                "imported_at": datetime.utcnow().isoformat(),
                "source": "ERP Import"
            }
            
            # Store in memory
            if supplier_id in SUPPLIERS_DB:
                suppliers_updated += 1
            else:
                suppliers_added += 1
            
            SUPPLIERS_DB[supplier_id] = supplier_data
        
        return {
            "status": "success",
            "suppliers_added": suppliers_added,
            "suppliers_updated": suppliers_updated,
            "total_processed": len(df),
            "message": f"Successfully imported {len(df)} suppliers from ERP"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERP Import Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.post("/sync-inventory")
async def sync_inventory_data(inventory_data: List[Dict[str, Any]]):
    """
    Sync real-time inventory data from ERP
    
    Expected format:
    [
        {
            "supplier_id": "SUP001",
            "product_sku": "PROD123",
            "current_stock": 5000,
            "reorder_point": 1000,
            "lead_time_days": 30,
            "last_updated": "2024-01-12T10:00:00Z"
        }
    ]
    """
    try:
        updated_count = 0
        
        for item in inventory_data:
            inventory_ref = db.collection("inventory").document(
                f"{item['supplier_id']}_{item['product_sku']}"
            )
            
            inventory_ref.set({
                **item,
                "synced_at": datetime.utcnow().isoformat()
            }, merge=True)
            
            updated_count += 1
        
        return {
            "status": "success",
            "items_synced": updated_count,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.get("/suppliers")
def get_erp_suppliers(country: str = None, risk_tier: str = None):
    """
    Retrieve imported supplier data with optional filters
    """
    try:
        suppliers = list(SUPPLIERS_DB.values())
        
        # Apply filters
        if country:
            suppliers = [s for s in suppliers if s.get("country") == country]
        if risk_tier:
            suppliers = [s for s in suppliers if s.get("risk_tier") == risk_tier]
        
        return {
            "total": len(suppliers),
            "suppliers": suppliers
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inventory-status")
def get_inventory_status(supplier_id: str = None):
    """
    Get current inventory status for risk assessment
    """
    try:
        inventory_ref = db.collection("inventory")
        
        if supplier_id:
            inventory_ref = inventory_ref.where("supplier_id", "==", supplier_id)
        
        inventory_items = []
        critical_items = []
        
        for doc in inventory_ref.stream():
            item = doc.to_dict()
            inventory_items.append(item)
            
            # Flag critical items (below reorder point)
            if item.get("current_stock", 0) < item.get("reorder_point", 0):
                critical_items.append(item)
        
        return {
            "total_items": len(inventory_items),
            "critical_items": len(critical_items),
            "inventory": inventory_items,
            "alerts": critical_items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def erp_webhook(payload: Dict[str, Any]):
    """
    Webhook endpoint for real-time ERP updates
    
    ERP systems can POST updates here when:
    - New purchase orders created
    - Inventory levels change
    - Supplier status updates
    """
    try:
        event_type = payload.get("event_type")
        data = payload.get("data", {})
        
        if event_type == "inventory_update":
            # Update inventory in real-time
            await sync_inventory_data([data])
            
        elif event_type == "supplier_update":
            # Update supplier information
            supplier_ref = db.collection("suppliers").document(data["supplier_id"])
            supplier_ref.update({
                **data,
                "updated_at": datetime.utcnow().isoformat()
            })
        
        return {
            "status": "received",
            "event_type": event_type,
            "processed_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
