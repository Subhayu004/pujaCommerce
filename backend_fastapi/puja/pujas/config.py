from pymongo import MongoClient
from pymongo.server_api import ServerApi
uri = "mongodb+srv://subhayuroy666_db_user:Subhayu_004@cluster0.avbeyuw.mongodb.net/"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client.puja
collections = db["pujas"]