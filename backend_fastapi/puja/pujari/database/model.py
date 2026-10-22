from pydantic import  BaseModel

class pujari(BaseModel) :
    name : str
    des : str
    is_available : bool