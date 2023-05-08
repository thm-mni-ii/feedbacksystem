from minio import Minio
import os.path
import time
import json

f = open("data/data.json")
data = json.load(f)
client = Minio(
    endpoint=data["endpoint"],
    access_key=data["access_key"],
    secret_key=data["secret_key"],
    secure=data["secure"]
)
found = client.bucket_exists("data")
if not found:
    print("no bucket found")
else:
    print("bucket found")
    client.fget_object("data", "cleaned_data_with_names.csv", "data/cleaned_data_with_names.csv")
