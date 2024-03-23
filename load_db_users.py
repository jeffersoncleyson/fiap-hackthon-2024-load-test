import logging
import pymongo
import os
import hashlib
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger()
logging.basicConfig(level = logging.INFO)

mongo_uri = os.getenv('MONGO_URI')
database_name = os.getenv('MONGO_DB')
collection_name = os.getenv('MONGO_COLLECTION')

mongo_client = pymongo.MongoClient(mongo_uri)
database = mongo_client[database_name]
collection = database[collection_name]

list_users = []
for i in range(1, 10000):
  username = f"USER{i}"
  hash_object = hashlib.sha256(username.encode())
  password = hash_object.hexdigest()
  user = {
    "username": username,
    "password": password,
    "role": 'USER'
  }
  list_users.append(user)
  logger.info(user)

collection.insert_many(list_users)

