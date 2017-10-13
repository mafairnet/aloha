#!/usr/bin/python

import MySQLdb
import warnings
import json
import os
import errno
import shutil
import requests
warnings.filterwarnings("ignore")

from dejavu import Dejavu
from dejavu.recognize import FileRecognizer

def make_sure_path_exists(path):
    try:
        os.makedirs(path)
    except OSError as exception:
        if exception.errno != errno.EEXIST:
            raise

def delete_temp_files(folder):
    for the_file in os.listdir(folder):
        file_path = os.path.join(folder, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path): shutil.rmtree(file_path)
        except Exception as e:
            print(e)

with open("/opt/dejavu/dejavu.cnf") as f:
    config = json.load(f)

djv = Dejavu(config)

fileServer = "http://OREKASERVERIP:8080/"
tempFolder = "/opt/aloha/temp/"

# Open database connection
db = MySQLdb.connect("OREKASERVERIP","DBUSER","PASSWORD","oreka" )

# prepare a cursor object using cursor() method
cursor = db.cursor()

sql = "SELECT id, filename, aloha_processed FROM oreka.orktape where aloha_processed = False limit 100"
sqlUpdate =  "update oreka.orktape set aloha_processed = 1"

#print sql

try:
   # Execute the SQL command
   cursor.execute(sql)
   # Fetch all the rows in a list of lists.
   results = cursor.fetchall()
   for row in results:
      id = row[0]
      filename = row[1]
      aloha_processed = row[2]
      # Now print fetched result
      print "ID="+str(id)+",File="+filename+",Processed="+str(aloha_processed)
      make_sure_path_exists(os.path.dirname(tempFolder+filename))
      r = requests.get(fileServer + filename)
      with open(tempFolder+filename, "wb") as code:
          code.write(r.content)
      song = djv.recognize(FileRecognizer, tempFolder + filename)
      print "From file we recognized: %s\n" % song
#except:
#   print "Error: unable to fecth data"
except (MySQLdb.Error, MySQLdb.Warning) as e:
    print(e)

delete_temp_files(tempFolder)

for row in results:
    try:
        id = row[0]    
        filename = row[1]
        cursor.execute(sqlUpdate + " where id = "+ str(id))
        print "Setting : " + filename + " as processed" 
        db.commit()
    except (MySQLdb.Error, MySQLdb.Warning) as e:
        db.rollback()
        print(e)

# disconnect from server
db.close()
