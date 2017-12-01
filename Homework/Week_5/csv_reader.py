# Author: Rick van Bork
# Std. nr: 11990503
# 
# CSV reader for KNMI stations with max, min, and average temperature.
# 
# It's functional... The final plan was to get rid of hardcode
# and automise the dict creation. As all relevant data is in the data.txt file.
# But I had too little time for this.

import csv
import json

csv_file = 'data/data.txt'

# initiate dataList
dataDict = {}

# open correct infile
with open(csv_file, newline = '') as csvfile:
	rows = csv.reader(csvfile)

	i = 0

	line_colors = ['rgb(0, 0, 102)', 'rgb(0, 0, 204)', 'rgb(0, 102, 255)']

	# for every row in file
	for row in rows:

		# if not empty and doesn't start with #
		if not row[0].startswith('#'):

			if int(row[0]) == 260:
				if i == 0:
					dataDict['De Bilt'] = {}
					dataDict['De Bilt']['Maximum'] = []
					dataDict['De Bilt']['Minimum'] = []
					dataDict['De Bilt']['Average'] = []
					dataDict['De Bilt']['Average'].append({'x': row[1], 'y': row[2]})
					dataDict['De Bilt']['Minimum'].append({'x': row[1], 'y': row[3]})
					dataDict['De Bilt']['Maximum'].append({'x': row[1], 'y': row[4]})
					i += 1
				else:
					dataDict['De Bilt']['Average'].append({'x': row[1], 'y': row[2]})
					dataDict['De Bilt']['Minimum'].append({'x': row[1], 'y': row[3]})
					dataDict['De Bilt']['Maximum'].append({'x': row[1], 'y': row[4]})
			elif int(row[0]) == 277:
				if i == 1:
					dataDict['Lauwersoog'] = {}
					dataDict['Lauwersoog']['Maximum'] = []
					dataDict['Lauwersoog']['Minimum'] = []
					dataDict['Lauwersoog']['Average'] = []
					dataDict['Lauwersoog']['Average'].append({'x': row[1], 'y': row[2]})
					dataDict['Lauwersoog']['Minimum'].append({'x': row[1], 'y': row[3]})
					dataDict['Lauwersoog']['Maximum'].append({'x': row[1], 'y': row[4]})
					i += 1
				else:
					dataDict['Lauwersoog']['Average'].append({'x': row[1], 'y': row[2]})
					dataDict['Lauwersoog']['Minimum'].append({'x': row[1], 'y': row[3]})
					dataDict['Lauwersoog']['Maximum'].append({'x': row[1], 'y': row[4]})
			elif int(row[0]) == 380:
				if i == 2:
					dataDict['Maastricht'] = {}
					dataDict['Maastricht']['Maximum'] = []
					dataDict['Maastricht']['Minimum'] = []
					dataDict['Maastricht']['Average'] = []
					dataDict['Maastricht']['Average'].append({'x': row[1], 'y': row[2]})
					dataDict['Maastricht']['Minimum'].append({'x': row[1], 'y': row[3]})
					dataDict['Maastricht']['Maximum'].append({'x': row[1], 'y': row[4]})
					i += 1
				else:
					dataDict['Maastricht']['Average'].append({'x': row[1], 'y': row[2]})
					dataDict['Maastricht']['Minimum'].append({'x': row[1], 'y': row[3]})
					dataDict['Maastricht']['Maximum'].append({'x': row[1], 'y': row[4]})

# outfile name
json_file = 'data_KNMI_.json'

# dump data into the outfile
with open(json_file, 'w') as outfile:
    outfile.write(json.dumps(dataDict))