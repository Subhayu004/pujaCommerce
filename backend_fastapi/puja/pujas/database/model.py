from pydantic import  BaseModel

class pujas(BaseModel) :
    title : str
    price : int
    des : str
