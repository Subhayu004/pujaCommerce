from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class pujas(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: str
    price: int
    des: str
    is_available: Optional[bool] = True
    updated_at: Optional[datetime] = None
