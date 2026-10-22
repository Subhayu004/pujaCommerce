def individual_data(pujas) :
    return{
        "id": str(pujas["_id"]),
        "title" : pujas["title"],
        "price" : str(pujas["price"]),
        "description" : pujas["des"],
        "available" : pujas["is_available"],

    }

def inventory_items(allpujas) :
    return [individual_data(pujas) for pujas in allpujas]