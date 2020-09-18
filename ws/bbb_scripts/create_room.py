#!/usr/bin/env python3

import urllib.parse
import os
import sys
import hashlib
import requests

API_URL = "https://fk-vv.mni.thm.de/bigbluebutton/api"

if len(sys.argv) != 5:
    print("usage: create_room.sh <meeting name> <meeting id> <attendee password> <moderator password>")
    sys.exit(1)

meetingName = sys.argv[1]
meetingNameParsed = urllib.parse.quote_plus(meetingName)
meetingID = sys.argv[2]
attendeePW = sys.argv[3]
moderatorPW = sys.argv[4]
bbbSecret = os.getenv('BBB_SECRET')

queryString = f'name={meetingNameParsed}&meetingID={meetingID}&attendeePW={attendeePW}&moderatorPW={moderatorPW}'
checksum = hashlib.sha1(f'create{queryString}{bbbSecret}'.encode('utf-8')).hexdigest()
queryString += f'&checksum={checksum}'

url = f'{API_URL}/create?{queryString}'
response = requests.get(url)

if response.status_code != 200:
    print("failed to create room")
    sys.exit(1)

print(f'{meetingName} {meetingID}')

