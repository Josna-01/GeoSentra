from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.risk.router import router as risk_router
from app.suppliers.router import router as suppliers_router
from app.market.router import router as market_router
from app.satellite.router import router as satellite_router
from app.stream.router import router as stream_router
from app.social.router import router as social_router
from app.erp.router import router as erp_router
from app.rfq.router import router as rfq_router
from app.shipping.router import router as shipping_router
from app.prediction.router import router as prediction_router

app = FastAPI(
    title="GeoSentra Backend",
    description="AI-Powered Supply Chain Risk Intelligence Platform",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core routers
app.include_router(risk_router)
app.include_router(suppliers_router)
app.include_router(market_router)
app.include_router(satellite_router)
app.include_router(stream_router)
app.include_router(social_router)

# Advanced features
app.include_router(erp_router)  # ERP Integration
app.include_router(rfq_router)  # Auto-RFQ Generation
app.include_router(shipping_router)  # Shipping Routes (Real AIS Data)
app.include_router(prediction_router)  # Cost Prediction (73K Dataset)

@app.get("/")
def root():
    return {
        "name": "GeoSentra API",
        "version": "3.0.0",
        "status": "operational",
        "features": [
            "AI-Powered Risk Detection",
            "Multi-Source Intelligence",
            "Satellite Monitoring",
            "Social Media Signals",
            "Shipping Routes Monitoring (Real AIS Data)",
            "Cost Impact Prediction (73K Scenarios)",
            "ERP Integration",
            "Auto-RFQ Generation"
        ],
        "docs": "/docs"
    }
