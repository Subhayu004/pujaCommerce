def individual_data(inventory) :
    return{
        "id": str(inventory["_id"]),
        "title" : inventory["title"],
        "price" : str(inventory["price"]),
        "description" : inventory["des"],
        "available" : inventory["is_available"],
        "stock" : str(inventory['stock'])
    }

def inventory_items(inventories) :
    return [individual_data(inventory) for inventory in inventories]