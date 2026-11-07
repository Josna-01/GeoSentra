from datetime import datetime
from app.db import db

def log_event(user: str, action: str):
    db.collection("audit_logs").add({
        "user": user,
        "action": action,
        "timestamp": datetime.utcnow()
    })
