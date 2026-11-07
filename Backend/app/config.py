from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "GeoSentra Backend"
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str = "super-secure-refresh-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FIREBASE_PROJECT_ID: str
    FIREBASE_CLIENT_EMAIL: str
    FIREBASE_PRIVATE_KEY: str

    GOOGLE_API_KEY: str = ""
    NEWS_API_KEY: str = ""
    MODEL_DIR: str = "d:/Ancilla/Backend/Model"
    DATASET_DIR: str = "d:/Ancilla/Backend/Dataset"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

settings = Settings()
