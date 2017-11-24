# import libraries
import csv
import json

csv_file = '../data/dataWeek_4_test.csv'

# initiate dataList
dataDict = []

# open correct infile
with open(csv_file, newline = '') as csvfile:
	rows = csv.reader(csvfile)

	# for every row in file
	for row in rows:

		# if not empty and doesn't start with #
		if row and not row[0].startswith('#'):
				dataDict.append({"country": row[0], "code": row[1], "y": row[2], "x": row[3], "continent": row[4]})

# outfile name
json_file = 'data_test.json'

# dump data into the outfile
with open(json_file, 'w') as outfile:
    outfile.write(json.dumps(dataDict))