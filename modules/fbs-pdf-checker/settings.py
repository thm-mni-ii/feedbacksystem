from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    llm_url: str = "http://example:1234/v1"
    mongo_url: str = "mongodb://mongodb:12345"
    mongo_db: str = "fbs-pdfchecker"
    mongo_collection_submissions: str = "submissions"
    mongo_collection_solutions: str = "solutions"
