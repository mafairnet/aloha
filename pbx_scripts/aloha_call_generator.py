#!/usr/bin/python

import MySQLdb
import warnings
import json
import os
import errno
import shutil
import datetime
warnings.filterwarnings("ignore")

#Frecuency variables
YEARLY		= 1
MONTHLY		= 2
WEEKLY		= 3
DAILY		= 4
HOURLY		= 5
MINUTELY	= 6
NONE		= 7

db = MySQLdb.connect("ALOHASERVERIP","DBUSER","PASSWORD","aloha" )

cursor = db.cursor()

sql = "select s.id, n.number from sample as s, number n where s.number = n.id and s.status = 1 limit 10"

try:
   cursor.execute(sql)
   results = cursor.fetchall()
except (MySQLdb.Error, MySQLdb.Warning) as e:
    print(e)

def updateSample(id):
    now = datetime.datetime.now()
    date  = now.strftime("%Y-%m-%d %H:%M")
    print "Updating ID="+ str(id)+",Date="+date
    sql = "update sample set status = 2, generated_datetime = '"+ date +"' where id = "+ str(id)
    try:
        cursor.execute(sql)
        db.commit()
    except (MySQLdb.Error, MySQLdb.Warning) as e:
        db.rollback()
        print(e)

def writeCallFile(number,id):
    f= open("/var/spool/asterisk/outgoing/call_"+number+".call","w+")
    f.write('Channel: Local/'+number+'@from-internal-xfer\r\nCallerId: "Aloha"<aloha-'+str(id)+'>\r\nMaxRetries: 0\r\nWaitTime: 0\r\nContext: macro-aloha\r\nExtension: s\r\nPriority: 1')
    f.close()

for row in results:
   id = row[0]
   number = row[1]
   print "ID="+str(id)+",Number="+number
   writeCallFile(number,id)
   updateSample(id)

db.close()
