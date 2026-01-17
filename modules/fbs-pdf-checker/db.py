from motor.motor_asyncio import AsyncIOMotorClient
from settings import Settings

settings = Settings()
client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.mongo_db]
collection_solutions = db[settings.mongo_collection_solutions]
collection_submissions = db[settings.mongo_collection_submissions]
