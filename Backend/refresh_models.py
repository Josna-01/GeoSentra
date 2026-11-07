import joblib
import os
import xgboost as xgb
import warnings
from sklearn.base import BaseEstimator

# Suppress warnings during the load/save process
warnings.filterwarnings("ignore")

MODEL_DIR = "d:/Ancilla/Backend/Model"

files = [
    "Event_Type_Encoder.pkl",
    "Numeric_Scaler.pkl",
    "XGB_Disruption_Duration_Model.pkl"
]

print("Refreshing ML models to fix version mismatch warnings...")

for f in files:
    path = os.path.join(MODEL_DIR, f)
    if os.path.exists(path):
        try:
            print(f"Processing {f}...")
            # Load the object (this triggers the warning which we are ignoring)
            obj = joblib.load(path)
            
            # Save it back immediately
            # This serializes it using the current versions of sklearn/xgboost
            joblib.dump(obj, path)
            print(f"Successfully refreshed {f}")
        except Exception as e:
            print(f"Failed to refresh {f}: {e}")
    else:
        print(f"File not found: {path}")

print("Model refresh complete.")
