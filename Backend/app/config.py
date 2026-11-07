import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "GeoSentra Backend"
    JWT_SECRET: str = "super-secure-jwt-secret-key"
    JWT_REFRESH_SECRET: str = "super-secure-refresh-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_PRIVATE_KEY: str = ""

    GOOGLE_API_KEY: str = ""
    NEWS_API_KEY: str = ""
    MODEL_DIR: str = str(BASE_DIR / "Model")
    DATASET_DIR: str = str(BASE_DIR / "Dataset")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

settings = Settings()
