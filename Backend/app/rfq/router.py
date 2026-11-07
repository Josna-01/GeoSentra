from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.erp.router import SUPPLIERS_DB

router = APIRouter(prefix="/rfq", tags=["RFQ Automation"])

# In-memory RFQ storage
RFQS_DB = {}
# In-memory events storage (from simulate crisis)
EVENTS_DB = {}

@router.post("/generate")
async def generate_rfq(
    affected_supplier_id: str,
    event_id: str,
    urgency: str = "High"
):
    """
    Automatically generate RFQ (Request for Quotation) to backup suppliers
    when primary supplier is affected by a disruption
    """
    try:
        # 1. Get affected supplier details
        affected_supplier = None
        
        # Try to find by ID first
        if affected_supplier_id in SUPPLIERS_DB:
            affected_supplier = SUPPLIERS_DB[affected_supplier_id]
        else:
            # Try to find by country name
            for supp_id, supp in SUPPLIERS_DB.items():
                if supp.get("country", "").lower() == affected_supplier_id.lower():
                    affected_supplier = supp
                    affected_supplier_id = supp_id
                    break
        
        if not affected_supplier:
            # Create a dummy supplier for demo
            affected_supplier = {
                "supplier_id": affected_supplier_id,
                "name": f"Supplier in {affected_supplier_id}",
                "country": affected_supplier_id,
                "category": "General",
                "contract_value": 500000,
                "lead_time_days": 30
            }
        
        # 2. Get event details (from EVENTS_DB or create dummy)
        event = EVENTS_DB.get(event_id, {
            "event_type": "Supply Chain Disruption",
            "location": {"country": affected_supplier.get("country")},
            "severity_score": 7,
            "summary": "Critical disruption affecting supplier operations"
        })
        
        # 3. Find alternative suppliers
        alternative_suppliers = find_alternative_suppliers(
            country=affected_supplier.get("country"),
            category=affected_supplier.get("category", "General"),
            exclude_id=affected_supplier_id
        )
        
        if not alternative_suppliers:
            # Create dummy alternatives for demo
            alternative_suppliers = [
                {"name": "Alternative Supplier 1", "country": "Germany", "contact_email": "alt1@example.com"},
                {"name": "Alternative Supplier 2", "country": "USA", "contact_email": "alt2@example.com"},
                {"name": "Alternative Supplier 3", "country": "Singapore", "contact_email": "alt3@example.com"}
            ]
        
        # 4. Calculate required capacity
        capacity_shortfall = calculate_shortfall(affected_supplier)
        
        # 5. Generate RFQ document
        rfq_id = f"RFQ-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        rfq_data = {
            "rfq_id": rfq_id,
            "created_at": datetime.utcnow().isoformat(),
            "urgency": urgency,
            "reason": f"Primary supplier disruption: {event.get('event_type')}",
            "event_details": {
                "event_id": event_id,
                "event_type": event.get("event_type"),
                "location": event.get("location"),
                "severity": event.get("severity_score", 7),
                "summary": event.get("summary", "Disruption event")
            },
            "affected_supplier": {
                "id": affected_supplier_id,
                "name": affected_supplier.get("name"),
                "country": affected_supplier.get("country"),
                "category": affected_supplier.get("category", "General"),
                "contract_value": affected_supplier.get("contract_value", 0)
            },
            "requirements": {
                "capacity_needed": capacity_shortfall,
                "lead_time_required": affected_supplier.get("lead_time_days", 30),
                "quality_standards": "ISO 9001 or equivalent",
                "delivery_terms": "FOB or CIF"
            },
            "alternative_suppliers": alternative_suppliers,
            "response_deadline": calculate_response_deadline(urgency),
            "status": "sent"
        }
        
        # 6. Store RFQ in memory
        RFQS_DB[rfq_id] = rfq_data
        
        # 7. Log email sending (actual sending requires SMTP config)
        emails_sent = [s["name"] for s in alternative_suppliers if s.get("contact_email")]
        print(f"✅ RFQ {rfq_id} generated")
        print(f"📧 Would send emails to: {', '.join(emails_sent)}")
        
        return {
            "status": "success",
            "rfq_id": rfq_id,
            "affected_supplier": affected_supplier.get("name"),
            "alternatives_contacted": len(emails_sent),
            "alternative_suppliers": [s["name"] for s in alternative_suppliers],
            "emails_sent_to": emails_sent,
            "capacity_shortfall": capacity_shortfall,
            "message": f"RFQ generated and sent to {len(emails_sent)} alternative suppliers"
        }
        
    except Exception as e:
        print(f"RFQ Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"RFQ generation failed: {str(e)}")


def find_alternative_suppliers(
    country: str,
    category: str,
    exclude_id: str,
    max_results: int = 5
) -> List[Dict]:
    """Find alternative suppliers in different regions with same category"""
    try:
        alternatives = []
        
        for supp_id, supplier in SUPPLIERS_DB.items():
            # Exclude the affected supplier and same country (diversification)
            if supp_id != exclude_id and supplier.get("country") != country:
                if supplier.get("category") == category or category == "General":
                    alternatives.append({
                        "id": supp_id,
                        "name": supplier.get("name"),
                        "country": supplier.get("country"),
                        "contact_email": supplier.get("contact_email", "")
                    })
                    
                    if len(alternatives) >= max_results:
                        break
        
        return alternatives[:max_results]
        
    except Exception as e:
        print(f"Error finding alternatives: {e}")
        return []


def calculate_shortfall(affected_supplier: Dict) -> str:
    """Calculate capacity shortfall based on supplier's contract value"""
    contract_value = affected_supplier.get("contract_value", 0)
    
    if contract_value > 1000000:
        return "High volume (>$1M annual)"
    elif contract_value > 100000:
        return "Medium volume ($100K-$1M annual)"
    else:
        return "Low volume (<$100K annual)"


def calculate_response_deadline(urgency: str) -> str:
    """Calculate RFQ response deadline based on urgency"""
    if urgency == "Critical":
        deadline = datetime.utcnow() + timedelta(days=2)
    elif urgency == "High":
        deadline = datetime.utcnow() + timedelta(days=5)
    else:
        deadline = datetime.utcnow() + timedelta(days=10)
    
    return deadline.isoformat()


@router.get("/list")
def list_rfqs(status: Optional[str] = None, limit: int = 20):
    """List all generated RFQs with optional status filter"""
    try:
        rfqs = list(RFQS_DB.values())
        
        # Apply status filter if provided
        if status:
            rfqs = [r for r in rfqs if r.get("status") == status]
        
        # Sort by created_at descending
        rfqs.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {
            "total": len(rfqs),
            "rfqs": rfqs[:limit]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{rfq_id}/status")
def update_rfq_status(rfq_id: str, status: str, notes: Optional[str] = None):
    """Update RFQ status (sent, responded, accepted, rejected)"""
    try:
        if rfq_id not in RFQS_DB:
            raise HTTPException(status_code=404, detail="RFQ not found")
        
        RFQS_DB[rfq_id]["status"] = status
        RFQS_DB[rfq_id]["updated_at"] = datetime.utcnow().isoformat()
        
        if notes:
            RFQS_DB[rfq_id]["notes"] = notes
        
        return {
            "status": "success",
            "rfq_id": rfq_id,
            "new_status": status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper function to store events from simulate crisis
def store_event(event_id: str, event_data: Dict):
    """Store event data for RFQ generation"""
    EVENTS_DB[event_id] = event_data
