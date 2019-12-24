import os
import sys
import datetime
from distutils.dir_util import copy_tree
from os.path import basename
from os import chdir
import re
import subprocess
from datetime import datetime
import json
from shutil import rmtree
### LOAD CONFIGURATION
configpath = os.path.dirname(os.path.abspath(__file__)) + "/backup_config.json"
CONFIG = json.load(open(configpath))

print(CONFIG)

git_backup_root = CONFIG["data"]["DEST_BASEPATH"]
BACKUP_BASEPATH = CONFIG["data"]["SRC_BASEPATH"]

# TODO "docker-config", but no kafka and zoo
backup_dirs = CONFIG["data"]["backup_dirs"]
#[ "docker-config/mysql1", "docker-config/mysql2", "docker-config/ws", "docker-config/secrettoken", "docker-config/sqlchecker",  "ws/upload-dir", "secrettoken-checker/upload-dir", "sql-checker/upload-dir"]
#backup_dirs = ["ws/upload-dir" , "secrettoken-checker/upload-dir"]


## LIB to handle main easy
def run_bash(cmd, verbose=False):
    if verbose:
        print(cmd)
    output = b""
    code = 0
    try:
        output = subprocess.check_output(cmd , shell=True)
    except subprocess.CalledProcessError as e:
        code = e.returncode
    return (output.decode("utf-8"), code)

def date_now(pathsafe=False):
    now = datetime.now()
    if pathsafe:
        return now.strftime("%Y-%m-%d_%H-%M-%S")
    else:
        return now.strftime("%Y-%m-%d %H:%M:%S")

def commit_msg():
    commit_message = "backup feedbacksystem from %s!" % (date_now())
    return commit_message

def git(cmd):
    chdir(git_backup_root)
    out = run_bash("git " + cmd)[0]
    print(out)
    return out

def cleanup():
    chdir(git_backup_root)
    output = ""
    for dir in filter(lambda x: x[0] != ".", os.listdir(".")):
        output += run_bash("""find "%s" -name .git -type d -exec rm -rf {} \;""" % (dir), True)[0]
    return output

def mysqldumper():
    host = CONFIG["db"]["host"]
    port = CONFIG["db"]["port"]
    user = CONFIG["db"]["user"]
    password = CONFIG["db"]["password"]
    dbs = CONFIG["db"]["dbs"]
    basepath = git_backup_root + "/mysqldumps/"
    os.makedirs(basepath, mode = 0o777, exist_ok = True)

    for db in dbs:
        path = basepath + date_now(True) + "_" + db
        run_bash("mysqldump --host=%s --port=%s  -u %s --password='%s' %s > %s.sql" % (host, port, user, password, db, path), True)


## Here starts main()    

for folder in backup_dirs:
    dirpath = git_backup_root + "/" + folder
    print(dirpath)
    # tidy up old version
    rmtree(dirpath)
    os.makedirs(dirpath, mode = 0o777, exist_ok = True)
    copy_tree(BACKUP_BASEPATH + "/" + folder, dirpath)
    

## clean up .git subdirs they are not needed, BUT NOT in MAINDIR
cleanup()

## mysqldump based on config
mysqldumper()

txt = git("status")
matches = re.search(r"working tree clean",txt, re.M | re.I)
print(matches)
if matches is None:
    ## the status is NOT clean, so we need to add all changes
    git("add *")
    git("add -A") # Also add the deleted files
    git("status")
    git("commit -m '%s'" % (commit_msg()))
    git("push")