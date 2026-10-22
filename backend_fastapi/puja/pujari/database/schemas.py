def individual_data(pujari) :
    return{
        "id": str(pujari["_id"]),
        "name" : pujari["name"],
        "description" : pujari["des"],
        "available" : pujari["is_available"],
    }

def pujari_list(pujaris) :
    return [individual_data(pujari) for pujari in pujaris]