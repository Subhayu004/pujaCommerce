from datetime import datetime
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_database, MONGO_URI
from models import InventoryItem, PujaItem, PujariItem
from schemas import (
    individual_inventory, inventory_items,
    individual_puja, puja_items,
    individual_pujari, pujari_items
)

app = FastAPI(
    title="PujaSathi FastAPI & MongoDB Backend",
    description="Unified FastAPI service connecting to MongoDB Atlas for Pujas, Inventory, and Pujari management.",
    version="1.0.0"
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def check_mongo_error(e: Exception):
    err_str = str(e)
    if "SSL: TLSV1_ALERT_INTERNAL_ERROR" in err_str or "ServerSelectionTimeoutError" in err_str:
        return (
            "MongoDB Atlas Connection Notice: MongoDB Atlas rejected the TLS connection. "
            "Please log into your MongoDB Atlas Dashboard -> Network Access -> IP Access List -> "
            "Click 'ADD IP ADDRESS' -> Select 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0). "
            f"Details: {err_str}"
        )
    return str(e)

# ========================================================
# HEALTH & STATUS ENDPOINT
# ========================================================
@app.get("/health")
@app.get("/api/health")
async def health_check():
    _, inv_col, _, _ = get_database()
    mongo_status = "connecting"
    count = 0
    message = "MongoDB connected successfully"
    try:
        if inv_col is not None:
            count = inv_col.count_documents({})
            mongo_status = "connected"
    except Exception as e:
        mongo_status = "disconnected"
        message = check_mongo_error(e)

    return {
        "status": "online",
        "service": "FastAPI",
        "mongo_status": mongo_status,
        "inventory_count": count,
        "message": message,
        "database": "puja",
        "collections": ["inventory", "pujas", "pujari"]
    }

# ========================================================
# 1. INVENTORY / ESSENTIALS CRUD
# ========================================================
inventory_router = APIRouter(prefix="/inventory", tags=["Inventory"])

@inventory_router.get("/")
async def get_all_inventory():
    try:
        _, col, _, _ = get_database()
        if col is None:
            raise Exception("MongoDB collection unavailable")
        data = list(col.find())
        for item in data:
            item["_id"] = str(item["_id"])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@inventory_router.post("/")
async def create_inventory(item: InventoryItem):
    try:
        _, col, _, _ = get_database()
        if col is None:
            raise Exception("MongoDB collection unavailable")
        item_data = item.model_dump()
        item_data["created_at"] = datetime.utcnow()
        result = col.insert_one(item_data)
        return {
            "status_code": 200,
            "id": str(result.inserted_id),
            "message": "Inventory item created successfully",
            "item": {**item_data, "_id": str(result.inserted_id), "created_at": item_data["created_at"].isoformat()}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@inventory_router.put("/{item_id}")
async def update_inventory(item_id: str, updated_item: InventoryItem):
    try:
        _, col, _, _ = get_database()
        id_obj = ObjectId(item_id)
        existing = col.find_one({"_id": id_obj})
        if not existing:
            raise HTTPException(status_code=404, detail="Item does not exist")
        
        item_dict = updated_item.model_dump()
        item_dict["updated_at"] = datetime.utcnow()
        col.update_one({"_id": id_obj}, {"$set": item_dict})
        return {
            "status_code": 200,
            "message": "Item Updated Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@inventory_router.delete("/{item_id}")
async def delete_inventory(item_id: str):
    try:
        _, col, _, _ = get_database()
        id_obj = ObjectId(item_id)
        existing = col.find_one({"_id": id_obj})
        if not existing:
            raise HTTPException(status_code=404, detail="Item does not exist")
        col.delete_one({"_id": id_obj})
        return {
            "status_code": 200,
            "message": "Item Deleted Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))


# ========================================================
# 2. PUJAS CRUD
# ========================================================
pujas_router = APIRouter(prefix="/pujas", tags=["Pujas"])

@pujas_router.get("/")
async def get_all_pujas():
    try:
        _, _, col, _ = get_database()
        if col is None:
            raise Exception("MongoDB collection unavailable")
        data = list(col.find())
        for item in data:
            item["_id"] = str(item["_id"])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@pujas_router.post("/")
async def create_puja(item: PujaItem):
    try:
        _, _, col, _ = get_database()
        if col is None:
            raise Exception("MongoDB collection unavailable")
        item_data = item.model_dump()
        item_data["created_at"] = datetime.utcnow()
        result = col.insert_one(item_data)
        return {
            "status_code": 200,
            "id": str(result.inserted_id),
            "message": "Puja created successfully",
            "item": {**item_data, "_id": str(result.inserted_id), "created_at": item_data["created_at"].isoformat()}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@pujas_router.put("/{item_id}")
async def update_puja(item_id: str, updated_item: PujaItem):
    try:
        _, _, col, _ = get_database()
        id_obj = ObjectId(item_id)
        existing = col.find_one({"_id": id_obj})
        if not existing:
            raise HTTPException(status_code=404, detail="Puja does not exist")
        
        item_dict = updated_item.model_dump()
        item_dict["updated_at"] = datetime.utcnow()
        col.update_one({"_id": id_obj}, {"$set": item_dict})
        return {
            "status_code": 200,
            "message": "Puja Updated Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@pujas_router.delete("/{item_id}")
async def delete_puja(item_id: str):
    try:
        _, _, col, _ = get_database()
        id_obj = ObjectId(item_id)
        existing = col.find_one({"_id": id_obj})
        if not existing:
            raise HTTPException(status_code=404, detail="Puja does not exist")
        col.delete_one({"_id": id_obj})
        return {
            "status_code": 200,
            "message": "Puja Deleted Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))


# ========================================================
# 3. PUJARI CRUD
# ========================================================
pujari_router = APIRouter(prefix="/pujari", tags=["Pujari"])

@pujari_router.get("/")
async def get_all_pujaris():
    try:
        _, _, _, col = get_database()
        if col is None:
            raise Exception("MongoDB collection unavailable")
        data = list(col.find())
        for item in data:
            item["_id"] = str(item["_id"])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@pujari_router.post("/")
async def create_pujari(item: PujariItem):
    try:
        _, _, _, col = get_database()
        if col is None:
            raise Exception("MongoDB collection unavailable")
        item_data = item.model_dump()
        item_data["created_at"] = datetime.utcnow()
        result = col.insert_one(item_data)
        return {
            "status_code": 200,
            "id": str(result.inserted_id),
            "message": "Pujari added successfully",
            "item": {**item_data, "_id": str(result.inserted_id), "created_at": item_data["created_at"].isoformat()}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@pujari_router.put("/{item_id}")
async def update_pujari(item_id: str, updated_item: PujariItem):
    try:
        _, _, _, col = get_database()
        id_obj = ObjectId(item_id)
        existing = col.find_one({"_id": id_obj})
        if not existing:
            raise HTTPException(status_code=404, detail="Pujari does not exist")
        
        item_dict = updated_item.model_dump()
        item_dict["updated_at"] = datetime.utcnow()
        col.update_one({"_id": id_obj}, {"$set": item_dict})
        return {
            "status_code": 200,
            "message": "Pujari Updated Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))

@pujari_router.delete("/{item_id}")
async def delete_pujari(item_id: str):
    try:
        _, _, _, col = get_database()
        id_obj = ObjectId(item_id)
        existing = col.find_one({"_id": id_obj})
        if not existing:
            raise HTTPException(status_code=404, detail="Pujari does not exist")
        col.delete_one({"_id": id_obj})
        return {
            "status_code": 200,
            "message": "Pujari Deleted Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=check_mongo_error(e))


# Include routers with standard prefix
app.include_router(inventory_router)
app.include_router(pujas_router)
app.include_router(pujari_router)

# Also include with /api prefix for seamless proxying
app.include_router(inventory_router, prefix="/api")
app.include_router(pujas_router, prefix="/api")
app.include_router(pujari_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("FASTAPI_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
