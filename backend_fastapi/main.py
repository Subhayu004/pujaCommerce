from datetime import datetime
from typing import Optional
from pathlib import Path
from bson import ObjectId
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

# MongoDB Atlas connection (exact credentials from user config.py)
MONGO_URI = "mongodb+srv://subhayuroy666_db_user:Subhayu_004@cluster0.avbeyuw.mongodb.net/"
client = MongoClient(MONGO_URI, server_api=ServerApi('1'), serverSelectionTimeoutMS=5000)
db = client.puja

inventory_col = db["inventory"]
pujas_col = db["pujas"]
pujari_col = db["pujari"]

# Exact models from user's model.py files with image/photo support
class inventory(BaseModel):
    model_config = ConfigDict(extra="allow")
    title: str
    price: int
    des: str
    image: Optional[str] = None
    is_available: bool = True
    stock: int = 10
    updated_at: Optional[datetime] = None

class pujas(BaseModel):
    model_config = ConfigDict(extra="allow")
    title: str
    price: int
    des: str
    image: Optional[str] = None
    is_available: Optional[bool] = True
    updated_at: Optional[datetime] = None

class pujari(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: str
    des: str
    photo: Optional[str] = None
    is_available: bool = True
    updated_at: Optional[datetime] = None

app = FastAPI(
    title="PujaSathi FastAPI & MongoDB Backend",
    version="1.0.0",
    redirect_slashes=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================================
# 1. INVENTORY CRUD (User exact endpoints)
# ========================================================
inventory_router = APIRouter(prefix="/inventory", tags=["Inventory"])

@inventory_router.get("")
@inventory_router.get("/")
async def get_inventory_items():
    try:
        data = list(inventory_col.find())
        for item in data:
            item["_id"] = str(item["_id"])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred: {e}")

@inventory_router.post("")
@inventory_router.post("/")
async def create_inventory_items(items: inventory):
    try:
        item_data = items.model_dump()
        result = inventory_col.insert_one(item_data)
        return {
            "status_code": 200,
            "id": str(result.inserted_id),
            "message": "Item created successfully",
            "item": {**item_data, "_id": str(result.inserted_id)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred: {e}")

@inventory_router.put("/{item_id}")
@inventory_router.put("/{item_id}/")
async def update_inventory_items(item_id: str, updated_item: inventory):
    try:
        id = ObjectId(item_id)
        existing_doc = inventory_col.find_one({"_id": id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Item does not exist")
        updated_item.updated_at = datetime.now()
        inventory_col.update_one({"_id": id}, {"$set": updated_item.model_dump()})
        return {
            "status_code": 200,
            "message": "Item Updated Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred {e}")

@inventory_router.delete("/{item_id}")
@inventory_router.delete("/{item_id}/")
async def delete_inventory_items(item_id: str):
    try:
        id = ObjectId(item_id)
        existing_doc = inventory_col.find_one({"_id": id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Item does not exist")
        inventory_col.delete_one({"_id": id})
        return {
            "status_code": 200,
            "message": "Item Deleted Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred {e}")


# ========================================================
# 2. PUJAS CRUD (User exact endpoints)
# ========================================================
pujas_router = APIRouter(prefix="/pujas", tags=["Pujas"])

@pujas_router.get("")
@pujas_router.get("/")
async def get_pujas_items():
    try:
        data = list(pujas_col.find())
        for item in data:
            item["_id"] = str(item["_id"])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred: {e}")

@pujas_router.post("")
@pujas_router.post("/")
async def create_pujas_items(items: pujas):
    try:
        item_data = items.model_dump()
        result = pujas_col.insert_one(item_data)
        return {
            "status_code": 200,
            "id": str(result.inserted_id),
            "message": "Item created successfully",
            "item": {**item_data, "_id": str(result.inserted_id)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred: {e}")

@pujas_router.put("/{item_id}")
@pujas_router.put("/{item_id}/")
async def update_pujas_items(item_id: str, updated_item: pujas):
    try:
        id = ObjectId(item_id)
        existing_doc = pujas_col.find_one({"_id": id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Item does not exist")
        updated_item.updated_at = datetime.now()
        pujas_col.update_one({"_id": id}, {"$set": updated_item.model_dump()})
        return {
            "status_code": 200,
            "message": "Item Updated Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred {e}")

@pujas_router.delete("/{item_id}")
@pujas_router.delete("/{item_id}/")
async def delete_pujas_items(item_id: str):
    try:
        id = ObjectId(item_id)
        existing_doc = pujas_col.find_one({"_id": id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Item does not exist")
        pujas_col.delete_one({"_id": id})
        return {
            "status_code": 200,
            "message": "Item Deleted Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred {e}")


# ========================================================
# 3. PUJARI CRUD (User exact endpoints)
# ========================================================
pujari_router = APIRouter(prefix="/pujari", tags=["Pujari"])

@pujari_router.get("")
@pujari_router.get("/")
async def get_pujari_items():
    try:
        data = list(pujari_col.find())
        for item in data:
            item["_id"] = str(item["_id"])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred: {e}")

@pujari_router.post("")
@pujari_router.post("/")
async def create_pujari_items(items: pujari):
    try:
        item_data = items.model_dump()
        result = pujari_col.insert_one(item_data)
        return {
            "status_code": 200,
            "id": str(result.inserted_id),
            "message": "Item created successfully",
            "item": {**item_data, "_id": str(result.inserted_id)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred: {e}")

@pujari_router.put("/{item_id}")
@pujari_router.put("/{item_id}/")
async def update_pujari_items(item_id: str, updated_item: pujari):
    try:
        id = ObjectId(item_id)
        existing_doc = pujari_col.find_one({"_id": id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Item does not exist")
        updated_item.updated_at = datetime.now()
        pujari_col.update_one({"_id": id}, {"$set": updated_item.model_dump()})
        return {
            "status_code": 200,
            "message": "Item Updated Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred {e}")

@pujari_router.delete("/{item_id}")
@pujari_router.delete("/{item_id}/")
async def delete_pujari_items(item_id: str):
    try:
        id = ObjectId(item_id)
        existing_doc = pujari_col.find_one({"_id": id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Item does not exist")
        pujari_col.delete_one({"_id": id})
        return {
            "status_code": 200,
            "message": "Item Deleted Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Some error occurred {e}")


# Mount routers with standard prefix
app.include_router(inventory_router)
app.include_router(pujas_router)
app.include_router(pujari_router)

# Mount with /api prefix for seamless proxy
app.include_router(inventory_router, prefix="/api")
app.include_router(pujas_router, prefix="/api")
app.include_router(pujari_router, prefix="/api")

@app.get("/health")
@app.get("/api/health")
async def health_check():
    mongo_status = "connecting"
    counts = {"inventory": 0, "pujas": 0, "pujari": 0}
    try:
        counts["inventory"] = inventory_col.count_documents({})
        counts["pujas"] = pujas_col.count_documents({})
        counts["pujari"] = pujari_col.count_documents({})
        mongo_status = "connected"
    except Exception as e:
        mongo_status = f"disconnected: {e}"

    return {
        "status": "online",
        "service": "FastAPI",
        "mongo_status": mongo_status,
        "counts": counts,
        "database": "puja"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("FASTAPI_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
