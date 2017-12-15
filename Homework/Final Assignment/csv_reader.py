# Author: Rick van Bork
# Std. nr: 11990503
# 
# CSV reader for KNMI stations with max, min, and average temperature.
# 
# Alter KNMI data by making the station and lon, lat rows CSVs. With row[0] == '' and row[1] the station code

import csv
import json

# csv_file = 'data/KNMI_1963.txt'
csv_file = 'data/KNMI_1963.txt'

# initiate dataList
dataDict = {}
stationDict = {}
code = 0

# open correct infile
with open(csv_file, newline = '') as csvfile:
	rows = csv.reader(csvfile)

	# for every row in file
	for row in rows:

		# if not empty and doesn't start with #
		if not row[0].startswith('#'):

			# fill stationdict
			if row[0] == '':

				# strip two spaces at the start of string, format to 'Title'
				stationDict["".join(row[1].split())] = row[5].strip('  ').title()

			elif row[0] == code and row[0] != '':
				dataDict[station]['Maximum'].append({'x': row[1], 'y': row[4]})
				dataDict[station]['Average'].append({'x': row[1], 'y': row[2]})
				dataDict[station]['Minimum'].append({'x': row[1], 'y': row[3]})

			else:
				key = "".join(row[0].split())
				station = stationDict[key]
				dataDict[station] = {}
				dataDict[station]['Maximum'] = [{'x': row[1], 'y': row[4]}]
				dataDict[station]['Average'] = [{'x': row[1], 'y': row[2]}]
				dataDict[station]['Minimum'] = [{'x': row[1], 'y': row[3]}]
				code = row[0]

# outfile name
json_file = 'data_KNMI_1963_test.json'

# dump data into the outfile
with open(json_file, 'w') as outfile:
    outfile.write(json.dumps(dataDict))