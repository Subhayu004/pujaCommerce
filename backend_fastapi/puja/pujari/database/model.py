from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class pujari(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str
    des: str
    is_available: bool = True
    updated_at: Optional[datetime] = None