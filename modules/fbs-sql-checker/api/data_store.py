from abc import ABCMeta, abstractmethod
from typing import Self

from pymongo import MongoClient


class DataStore(metaclass=ABCMeta):
    @abstractmethod
    def store(self, collection: str, obj: any):
        pass

    @abstractmethod
    def upsert(self, collection: str, query: any, update: any):
        pass

    @abstractmethod
    def query(self, collection: str, *query):
        pass


class AbstractMongoStore(DataStore, metaclass=ABCMeta):
    @classmethod
    def connect(cls, uri: str) -> Self:
        return MongoDataStore(MongoClient(uri))

    def store(self, collection: str, obj: any):
        return self.get_collection(collection).insert_one(obj)

    def query(self, collection, *query):
        return self.get_collection(collection).find(*query)

    def upsert(self, collection: str, query: any, update: any):
        return self.get_collection(collection).update_one(query, update, upsert=True)

    @abstractmethod
    def get_collection(self, collection):
        pass


class MongoDataStore(AbstractMongoStore):
    def __init__(self, client: MongoClient):
        self._client = client
        self.db = self._client.get_default_database()

    @classmethod
    def connect(cls, uri: str) -> Self:
        return cls(MongoClient(uri))

    def get_collection(self, collection):
        return self.db[collection]
