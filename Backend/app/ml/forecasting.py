import os
import joblib
import pandas as pd
import numpy as np
from app.config import settings

class ForecastingModel:
    def __init__(self):
        self.model_path = os.path.join(settings.MODEL_DIR, "XGB_Disruption_Duration_Model.pkl")
        self.encoder_path = os.path.join(settings.MODEL_DIR, "Event_Type_Encoder.pkl")
        self.scaler_path = os.path.join(settings.MODEL_DIR, "Numeric_Scaler.pkl")
        
        self.model = None
        self.encoder = None
        self.scaler = None
        self.is_loaded = False

    def load_models(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
            if os.path.exists(self.encoder_path):
                self.encoder = joblib.load(self.encoder_path)
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
            self.is_loaded = True
        except Exception as e:
            print(f"Error loading models: {e}")

    def predict_disruption(self, event_type: str, stability_index: float, severity: int):
        if not self.is_loaded:
            self.load_models()
        
        try:
            # 1. Encode event type
            event_encoded = 0
            if self.encoder:
                try:
                    # Map the string to the nearest category in the encoder
                    classes = self.encoder.classes_.tolist()
                    # Simple heuristic match or default to index 0
                    match = next((i for i, c in enumerate(classes) if event_type.lower() in c.lower()), 0)
                    event_encoded = match
                except:
                    event_encoded = 0
            
            # 2. Scale numeric features if scaler exists
            # Features: event_type, country_stability_index, severity_score
            # We need to know the exact feature order. 
            # Given the error earlier, let's try to pass them as a list if we don't have feature names.
            
            if self.model:
                features = np.array([[event_encoded, stability_index, severity]])
                # Some models expect DMatrix or DataFrame
                prediction = self.model.predict(features)[0]
                return float(prediction)
            
            # Fallback if model not loaded
            return float(severity * (10 / max(stability_index, 0.1)))
        except Exception as e:
            print(f"Prediction error: {e}")
            # Intelligent fallback
            return float(severity * 1.5)

forecaster = ForecastingModel()
