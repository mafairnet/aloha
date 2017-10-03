#!/usr/bin/python

import MySQLdb
import warnings
import json
import os
import errno
import shutil
import requests
import urllib2
warnings.filterwarnings("ignore")

from dejavu import Dejavu
from dejavu.recognize import FileRecognizer
from string import Template

#Initializind Dejavu
with open("/opt/dejavu/dejavu.cnf") as f:
    config = json.load(f)
djv = Dejavu(config)

#Aloha recorder server definitions
#fileServer = "http://dev007.pricetravel.com.mx:8080/"
fileServer = "http://172.21.0.246:8080/"

#Aloha temporal files folder
tempFolder = "/opt/aloha/temp/"

#SQL Querys definitions
sqlAlohaProccessing = "select id from sample where status = 2 order by id desc limit 100"
sqlAlohaRecorder = Template('SELECT id, filename FROM oreka.orktape where localParty = "aloha$id" order by id desc')
sqlAlohaUpdate = Template('update sample set status = $status, tape = $tape, audio = $audio, confidence = $confidence, offset_seconds = $offset_seconds, match_time = $match_time, offset = $offset where id = $id')

#Function to check the temp folder exists if not it creates it
def make_sure_path_exists(path):
    try:
        os.makedirs(path)
    except OSError as exception:
        if exception.errno != errno.EEXIST:
            raise

#Delete temporal files from temporal folder
def delete_temp_files(folder):
    for the_file in os.listdir(folder):
        file_path = os.path.join(folder, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path): shutil.rmtree(file_path)
        except Exception as e:
            print(e)

#Get data from the call recordings
def obtainPendingCalls():
    db = MySQLdb.connect("172.21.0.245","root","","aloha" )
    try:
        cursor = db.cursor()
        cursor.execute(sqlAlohaProccessing)
        results = cursor.fetchall()
    except (MySQLdb.Error, MySQLdb.Warning) as e:
        print(e)
    db.close()
    return results

#Update data from call recordings with AudioFingerPrinting results
def updateCallsData(callRecordingId,callData):
    db = MySQLdb.connect("172.21.0.245","root","","aloha" )
    try:
        cursor = db.cursor()
	tape = str(callRecordingId)
        audio = str(callData['song_id'])
        confidence = callData['confidence']
        offset_seconds = str(callData['offset_seconds'])
        match_time = str(callData['match_time'])
        offset = str(callData['offset'])
        if confidence>=20:
            status = 3
        elif confidence >= 10: 
            status = 5
            sendAlert("Verify%20TestID:"+str(id))
        else:
            status = 4
            sendAlert("Failed%20TestID:"+str(id))
        confidence = str(confidence)
        finalSql = sqlAlohaUpdate.substitute(status=status, id=str(id), confidence=confidence,offset_seconds=offset_seconds,match_time=match_time,offset=offset,tape=tape,audio=audio)
        #print finalSql
        cursor.execute(finalSql)
        print "Updating Sample ID : " + str(id) + ",Status="+ str(status)
        db.commit()
    except (MySQLdb.Error, MySQLdb.Warning) as e:
        db.rollback()
        print(e)
    db.close()

def getCallRecording(id):
    db = MySQLdb.connect("172.21.0.246","aloha_user","CI.2016","oreka" )
    try:
        cursor = db.cursor()
        cursor.execute(sqlAlohaRecorder.substitute(id=str(id)))
        #results = cursor.fetchall()
        row = cursor.fetchone()
    except (MySQLdb.Error, MySQLdb.Warning) as e:
        print(e)
    db.close()
    print(row)
    return row

#Analize call recording with existing AudioFinge2rPrintings
def checkAudioFingerprintig(callRecordingData):
    id = callRecordingData[0]
    filename = callRecordingData[1]
    print "ID="+str(id)+",File="+filename
    make_sure_path_exists(os.path.dirname(tempFolder+filename))
    r = requests.get(fileServer + filename)
    with open(tempFolder+filename, "wb") as code:
        code.write(r.content)
    audio = djv.recognize(FileRecognizer, tempFolder + filename)
    print "From file we recognized: %s\n" % audio
    return audio

def sendAlert(text):
    alertUrl = "http://dev078.pricetravel.com.mx:88/ucom/index.php?media=tlg&type=72763807&tittle=ALOHA%20Notification&body=" + text 
    urllib2.urlopen(alertUrl).read()

#Obtain pending calls
pendingCalls = obtainPendingCalls()

#Process pending calls
for row in pendingCalls:
    id = row[0]
    print "ID="+str(id)
    callRecordingData = getCallRecording(id)
    if not callRecordingData:
        print "Not recording found"
    else:
        fingerPrintingData = checkAudioFingerprintig(callRecordingData)
        updateCallsData(callRecordingData[0],fingerPrintingData)
delete_temp_files(tempFolder)
