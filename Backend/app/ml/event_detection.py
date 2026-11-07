import os
import json
import google.generativeai as genai
from app.config import settings

class EventDetector:
    def __init__(self):
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        # Switching to gemini-1.5-pro for better stability
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    def extract_event(self, text: str):
        prompt = f"""
        Extract geopolitical events from the following text that are relevant to supply chains.
        
        Rule: Extract only supply-chain relevant events (Strikes, Sanctions, Natural Disasters, Conflict).
        Rule: Ignore general political noise (Elections, speeches) unless specific threats are made.
        Rule: For coordinates, provide the [lat, lng] of the specific city. If city is unknown/ambiguous, provide coordinates for the country's capital or center.

        Define JSON Output Schema:
        {{
          "event_type": "string (enum: Strike, Conflict, Sanction, Disaster)",
          "location": {{
            "city": "string (City Name or 'Unknown')",
            "country": "string",
            "coordinates": [lat, lng]
          }},
          "severity_score": "integer (1-10)",
          "summary": "string (Max 20 words)",
          "affected_sectors": ["string"]
        }}

        Text: {text}
        
        Return ONLY the JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Find JSON in response
            content = response.text.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Gemini error: {e}. Falling back to heuristic extraction.")
            return self._heuristic_extract(text)

    def _heuristic_extract(self, text: str):
        """Fallback to keyword-based extraction if LLM fails"""
        lower_text = text.lower()
        
        # 1. Determine Event Type
        event_type = "Disaster" # Default
        if any(w in lower_text for w in ["strike", "labor", "union", "protest", "walkout"]):
            event_type = "Strike"
        elif any(w in lower_text for w in ["sanction", "trade", "ban", "tariff", "embargo"]):
            event_type = "Sanction"
        elif any(w in lower_text for w in ["conflict", "war", "attack", "tension", "military"]):
            event_type = "Conflict"
        
        # 2. Heuristic Severity (1-10)
        severity = 5
        critical_words = ["severe", "major", "critical", "shut down", "halt", "category 4", "category 5"]
        if any(w in lower_text for w in critical_words):
            severity = 8
        elif "minor" in lower_text or "possible" in lower_text:
            severity = 3

        # 3. Simple Country Detection (Limited list for fallback)
        countries = {
            "china": {"city": "Shanghai", "coords": [31.2304, 121.4737]},
            "taiwan": {"city": "Taipei", "coords": [25.0330, 121.5654]},
            "usa": {"city": "Washington", "coords": [38.9072, -77.0369]},
            "ukraine": {"city": "Kyiv", "coords": [50.4501, 30.5234]},
            "russia": {"city": "Moscow", "coords": [55.7558, 37.6173]},
            "germany": {"city": "Berlin", "coords": [52.5200, 13.4050]},
            "netherlands": {"city": "Rotterdam", "coords": [51.9244, 4.4777]}
        }
        
        detected_location = {"city": "Unknown", "country": "Unknown", "coordinates": [0, 0]}
        for country, data in countries.items():
            if country in lower_text:
                detected_location = {
                    "city": data["city"], # Guess capital/major hub
                    "country": country.capitalize(),
                    "coordinates": data["coords"]
                }
                break

        return {
            "event_type": event_type,
            "location": detected_location,
            "severity_score": severity,
            "summary": text[:100] + "..." if len(text) > 100 else text,
            "affected_sectors": ["Logistics", "Supply Chain"]
        }

detector = EventDetector()
