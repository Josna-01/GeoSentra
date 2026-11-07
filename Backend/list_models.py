import google.generativeai as genai
from app.config import settings
import os
import warnings
warnings.filterwarnings("ignore")

print("---MODELS_START---")
try:
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
print("---MODELS_END---")
