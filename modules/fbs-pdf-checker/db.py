from motor.motor_asyncio import AsyncIOMotorClient
from settings import Settings

settings = Settings()
client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.mongo_db]
collection = db[settings.mongo_collection]
