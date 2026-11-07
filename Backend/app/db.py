import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings
import datetime

# Path to service account JSON
CERT_PATH = "d:/Ancilla/geosentra-5eae8-firebase-adminsdk-fbsvc-2765aca024.json"

class LocalDB:
    """A simplistic JSON-based Mock Firestore for local development."""
    def __init__(self, storage_file="local_db.json"):
        self.storage_file = storage_file
        self.data = self._load_data()

    def _load_data(self):
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r") as f:
                    return json.load(f)
            except:
                return {}
        return {}

    def _save_data(self):
        with open(self.storage_file, "w") as f:
            json.dump(self.data, f, indent=2, default=str)

    def collection(self, name):
        return CollectionReference(name, self)

class CollectionReference:
    def __init__(self, name, db_instance):
        self.name = name
        self.db = db_instance

    def add(self, document_data):
        if self.name not in self.db.data:
            self.db.data[self.name] = {}
        
        # Generates a simple ID
        doc_id = f"doc_{int(datetime.datetime.now().timestamp() * 1000)}"
        self.db.data[self.name][doc_id] = document_data
        self.db._save_data()
        
        # Return tuple like firestore (timestamp, doc_ref)
        return (None, DocumentReference(doc_id, self.db.data[self.name][doc_id]))

    def document(self, doc_id):
        if self.name in self.db.data and doc_id in self.db.data[self.name]:
            return DocumentSnapshot(doc_id, self.db.data[self.name][doc_id], exists=True)
        return DocumentSnapshot(doc_id, {}, exists=False)

    def order_by(self, field, direction="ASCENDING"):
        return self # partial mock, ignores sort for now

    def limit(self, count):
        return self # partial mock, ignores limit for now

    def stream(self):
        # Reload from disk to ensure we have latest data from other processes/writes
        self.db.data = self.db._load_data()
        
        if self.name not in self.db.data:
            return []
        
        docs = []
        # Sort by timestamp desc if possible (simple heuristic)
        items = list(self.db.data[self.name].items())
        # Try to sort reverse by timestamp if it exists, else default
        try:
            items.sort(key=lambda x: x[1].get('timestamp', ''), reverse=True)
        except:
            pass
            
        for doc_id, data in items:
            docs.append(DocumentSnapshot(doc_id, data, exists=True))
        return docs

class DocumentReference:
    def __init__(self, id, data):
        self.id = id
        self._data = data

class DocumentSnapshot:
    def __init__(self, id, data, exists):
        self.id = id
        self._data = data
        self.exists = exists
        
    def to_dict(self):
        return self._data

# Initialize DB with Fallback
# NOTE: Forcing LocalDB because the cloud project doesn't have a Firestore DB provisioned yet (404 error)
try:
    # if os.path.exists(CERT_PATH):
    #     cred = credentials.Certificate(CERT_PATH)
    #     firebase_admin.initialize_app(cred)
    #     db = firestore.client()
    #     print("✅ Firestore connected successfully.")
    # else:
    #     raise Exception("Certificate file not found")
    raise Exception("Forcing LocalDB")
except Exception as e:
    print(f"⚠️  Switched to LocalDB (JSON mode) due to: {e}")
    db = LocalDB()
