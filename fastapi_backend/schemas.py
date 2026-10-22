def individual_inventory(item):
    return {
        "id": str(item.get("_id", "")),
        "title": item.get("title", ""),
        "price": str(item.get("price", 0)),
        "description": item.get("des", ""),
        "available": bool(item.get("is_available", True)),
        "stock": str(item.get("stock", 0))
    }

def inventory_items(items):
    return [individual_inventory(item) for item in items]

def individual_puja(item):
    return {
        "id": str(item.get("_id", "")),
        "title": item.get("title", ""),
        "price": str(item.get("price", 0)),
        "description": item.get("des", ""),
        "available": bool(item.get("is_available", True)),
    }

def puja_items(items):
    return [individual_puja(item) for item in items]

def individual_pujari(item):
    return {
        "id": str(item.get("_id", "")),
        "name": item.get("name", ""),
        "description": item.get("des", ""),
        "available": bool(item.get("is_available", True)),
    }

def pujari_items(items):
    return [individual_pujari(item) for item in items]
