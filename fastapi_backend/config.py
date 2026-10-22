import os
import certifi
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# MongoDB Atlas URI provided by user
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://subhayuroy666_db_user:Subhayu_004@cluster0.avbeyuw.mongodb.net/?retryWrites=true&w=majority"
)

client = None
db = None
inventory_collection = None
pujas_collection = None
pujari_collection = None

def get_database():
    global client, db, inventory_collection, pujas_collection, pujari_collection
    if db is None:
        try:
            # Use certifi for TLS validation on Linux container
            client = MongoClient(
                MONGO_URI,
                server_api=ServerApi('1'),
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=4000
            )
            db = client.puja
            inventory_collection = db["inventory"]
            pujas_collection = db["pujas"]
            pujari_collection = db["pujari"]
        except Exception as e:
            print(f"[MongoDB Error] Connection initiation error: {e}")
    return db, inventory_collection, pujas_collection, pujari_collection
