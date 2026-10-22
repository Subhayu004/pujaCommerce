from datetime import datetime
from database.schemas import pujari_list
from database.model import pujari
from fastapi import APIRouter, FastAPI, HTTPException
from config import collections
from bson import ObjectId

app = FastAPI()
router = APIRouter()


@router.get("/")
async def get_items():
    try:
        data = list(collections.find())

        # Convert MongoDB ObjectId to a JSON-compatible string
        for item in data:
            item["_id"] = str(item["_id"])

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Some error occurred: {e}"
        )


@router.post("/")
async def create_items(items: pujari):
    try:
        # Convert the Pydantic model to a dictionary
        item_data = items.model_dump()

        # Insert into MongoDB
        result = collections.insert_one(item_data)

        # Return the inserted ID as a string
        return {
            "status_code": 200,
            "id": str(result.inserted_id),
            "message": "Item created successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Some error occurred: {e}"
        )

@router.put("/{item_id}")
async def update_items(item_id: str, updated_item: pujari):
    try:
        id = ObjectId(item_id)

        existing_doc = collections.find_one({"_id": id})

        if not existing_doc:
            raise HTTPException(
                status_code=404,
                detail="Item does not exist"
            )

        updated_item.updated_at = datetime.now()

        resp = collections.update_one(
            {"_id": id},
            {"$set": updated_item.model_dump()}
        )

        return {
            "status_code": 200,
            "message": "Item Updated Successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Some error occurred {e}"
        )

@router.delete("/{item_id}")
async def delete_items(item_id: str):
    try:
        id = ObjectId(item_id)

        existing_doc = collections.find_one({"_id": id})

        if not existing_doc:
            raise HTTPException(
                status_code=404,
                detail="Item does not exist"
            )

        resp = collections.delete_one({"_id": id})

        return {
            "status_code": 200,
            "message": "Item Deleted Successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Some error occurred {e}"
        )
app.include_router(router)
