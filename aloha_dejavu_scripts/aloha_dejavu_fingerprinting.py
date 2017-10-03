#!/usr/bin/python

import warnings
import json
warnings.filterwarnings("ignore")

from dejavu import Dejavu
from dejavu.recognize import FileRecognizer, MicrophoneRecognizer

# load config from a JSON file (or anything outputting a python dictionary)
with open("/opt/dejavu/dejavu.cnf") as f:
    config = json.load(f)

if __name__ == '__main__':

	# create a Dejavu instance
	djv = Dejavu(config)

	# Fingerprint all the mp3's in the directory we give it
	#djv.fingerprint_directory("/opt/dejavu/mp3/", [".mp3"])

        #djv.fingerprint_directory("/opt/dejavu/mexmix/", [".wav"])
	djv.fingerprint_directory("/var/www/html/dejavu/audios/", [".wav",".mp3"])
