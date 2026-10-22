from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class InventoryItem(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: str
    price: int
    des: str
    is_available: bool = True
    stock: int = 10
    updated_at: Optional[datetime] = None

class PujaItem(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: str
    price: int
    des: str
    is_available: Optional[bool] = True
    updated_at: Optional[datetime] = None

class PujariItem(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str
    des: str
    is_available: bool = True
    updated_at: Optional[datetime] = None
