# formatting.py

# Checks if an element is a valid  String
def is_string(data):
    if isinstance(data, str):
        return True
    return False


# Checks if an element is a dictionary
def is_dict(data):
    if isinstance(data, dict):
        return True
    return False


# Checks if 'from' is in JSON
def is_from(data):
    if "from" in data:
        return True
    return False


# Checks if 'select' is in JSON
def is_select(data):
    if "select" in data:
        return True
    return False


def is_order_by(data):
    if "orderby" in data:
        return True
    return False
