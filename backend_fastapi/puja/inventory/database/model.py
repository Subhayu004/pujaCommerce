from pydantic import  BaseModel

class inventory(BaseModel) :
    title : str
    price : int
    des : str
    is_available : bool
    stock : int