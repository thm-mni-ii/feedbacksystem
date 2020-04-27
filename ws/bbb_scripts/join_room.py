#!/usr/bin/env python3

import urllib.parse
import os
import sys
import hashlib

API_URL = 'https://fk-vv.mni.thm.de/bigbluebutton/api'

if len(sys.argv) != 4:
    print('usage: join_meeting.py <full name> <meeting id> <password>')
    sys.exit(1)

fullName = sys.argv[1]
fullNameParsed = urllib.parse.quote_plus(fullName)
meetingID = sys.argv[2]
password = sys.argv[3]
bbbSecret = os.getenv('BBB_SECRET')

queryString = f'fullName={fullNameParsed}&meetingID={meetingID}&password={password}'
checksum = hashlib.sha1(f'join{queryString}{bbbSecret}'.encode('utf-8')).hexdigest()
queryString += f'&checksum={checksum}'

print(f'{API_URL}/join?{queryString}')
