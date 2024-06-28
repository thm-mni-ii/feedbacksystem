def find_table_and_column(entire_message, first, second):
    table_name = entire_message[: entire_message.find(first)]
    column_name = entire_message[
        entire_message.find(first) + 3 : entire_message.find(second)
    ]
    return table_name, column_name
