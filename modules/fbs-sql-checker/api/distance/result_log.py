import os
from . import constants as c


def write_to_log(message: str):
    # Create folder if it doesn't exist
    try:
        if not os.path.exists(c.FOLDER_PATH):
            os.makedirs(c.FOLDER_PATH)
    except Exception as e:
        print(f"FolderError: {e}")
        return

    # Write message to the log file
    try:
        with open(c.LOG_PATH, "a", encoding="utf-8") as log_file:
            log_file.write(message + "\n")
    except Exception as e:
        print(f"FileError: {e}")
    log_file.close()
