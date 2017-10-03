#!/usr/bin/python

import MySQLdb
import warnings
import json
import os
import errno
import shutil
import datetime
from datetime import time
warnings.filterwarnings("ignore")

#Frecuency variables
YEARLY		= 1
MONTHLY		= 2
WEEKLY		= 3
DAILY		= 4
HOURLY		= 5
MINUTELY	= 6
NONE		= 7

db = MySQLdb.connect("172.21.0.245","aloha_user","CTI.2016","aloha" )

cursor = db.cursor()

sql = "select t.id as id, t.name as name, t.status, t.scan_date_time as scan_date_time, t.frecuency as frecuency , t.end_scan_date_time as end_scan_date_time , sample_time.generated_datetime from test t left join (select test, max(generated_datetime) as generated_datetime from sample group by test) as sample_time on sample_time.test = t.id where t.frecuency != 7 and t.scan_date_time < NOW() and t.end_scan_date_time > NOW()"

try:
   cursor.execute(sql)
   results = cursor.fetchall()
except (MySQLdb.Error, MySQLdb.Warning) as e:
    print(e)

def updateTestSample(id):
    now = datetime.datetime.now()
    date  = now.strftime("%Y-%m-%d %H:%M")
    print "Updating ID="+ str(id)+",Date="+date
    sql = "update sample set status = 2 where test = "+ str(id)
    try:
        cursor.execute(sql)
        db.commit()
    except (MySQLdb.Error, MySQLdb.Warning) as e:
        db.rollback()
        print(e)

for row in results:
   id = row[0]
   print "TESTID="+str(id)
   currentDate = datetime.datetime.now()
   print str(row[3]) + "," + str(row[6])
   scanDate = datetime.datetime.strptime(str(row[3]),"%Y-%m-%d %H:%M:%S")
   if row[6]:
      generatedDate = datetime.datetime.strptime(str(row[6]), "%Y-%m-%d %H:%M:%S")
   else:
      generatedDate = datetime.datetime.strptime(str('1988-01-01 00:00:00'), "%Y-%m-%d %H:%M:%S")
   if currentDate>scanDate:
       if row[4] == NONE:
           updateTestSample(id)
       else:
           endScanDate = datetime.datetime.strptime(str(row[5]), "%Y-%m-%d %H:%M:%S")
           if currentDate < endScanDate: 
               if row[4] == MINUTELY:
                   if currentDate.minute != generatedDate.minute:
                       updateTestSample(id)
               elif row[4] == HOURLY:
                   if currentDate.hour != generatedDate.hour:
                       updateTestSample(id)
               elif row[4] == DAILY:
                   if currentDate.day != generatedDate.day:
                       updateTestSample(id)
               elif row[4] == WEEKLY:
                   if currentDate.strftime("%V") != generatedDate.strftime("%V"):
                       updateTestSample(id)
               elif row[4] == MONTHLY:
                   if currentDate.month != generatedDate.month:
                       updateTestSample(id)
               elif row[4] == YEARLY: 
                   if currentDate.year != generatedDate.year:
                       updateTestSample(id)
db.close()
