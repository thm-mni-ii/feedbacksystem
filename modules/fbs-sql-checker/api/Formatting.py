#Formatting.py

# Checks if an element is a valid  String
def isString(data):
    if (isinstance(data, str)):
        return True
    else:
        return False


# Checks if an element is a dictionary
def isDict(data):
    if (isinstance(data, dict)):
        return True
    else:
        return False


# Checks if 'from' is in JSON
def isFrom(data):
    if ('from' in data):
        return True
    else:
        return False


# Checks if 'select' is in JSON
def isSelect(data):
    if ('select' in data):
        return True
    else:
        return False

def isOrderBy(data):
    if ('orderby' in data):
        return True
    else:
        return False
