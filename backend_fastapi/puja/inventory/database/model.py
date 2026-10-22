from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class inventory(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: str
    price: int
    des: str
    is_available: bool = True
    stock: int = 10
    updated_at: Optional[datetime] = None