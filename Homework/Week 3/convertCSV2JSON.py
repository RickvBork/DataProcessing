# import libraries
import csv
import json

# infile name
csv_file = 'KNMI_20151231.txt'

# initiate dataList
dataDict = {'date': [], 'precipitation': []}

# open correct infile
with open(csv_file, newline='') as csvfile:
	rows = csv.reader(csvfile)
	for row in rows:
		
		# OPTIMALIZATION length of dicts
		# if the string is a data string
		if not row[0].startswith('#'):
			dataDict['date'].append(row[1])
			dataDict['precipitation'].append(row[2].replace(' ',''))

# outfile name
json_file = 'dataJSON.txt'

# dump data into the outfile
with open(json_file, 'w') as outfile:
    outfile.write(json.dumps(dataDict))