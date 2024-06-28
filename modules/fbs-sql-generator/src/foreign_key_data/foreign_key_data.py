def check_for_foreign_key(column, foreign_keys, table_name):
    for key in foreign_keys:
        if key[0] == table_name and key[1] == column:
            return True
    return False
