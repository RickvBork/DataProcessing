# import libraries
import csv
import json

csv_file = 'data/data.txt'

# initiate dataList
dataDict = {'Bild': {'x': [], 'y0': [], 'y1': [], 'y2': []}, 'Lauwersoog': {'x': [], 'y0': [], 'y1': [], 'y2': []}, 'Maastricht': {'x': [], 'y0': [], 'y1': [], 'y2': []}}

i = 0

# open correct infile
with open(csv_file, newline = '') as csvfile:
	rows = csv.reader(csvfile)

	# for every row in file
	for row in rows:

		# if not empty and doesn't start with #
		if not row[0].startswith('#'):
			i += 1

			print(row)

			if int(row[0]) == 260:
				dataDict['Bild']['x'].append(i)
				dataDict['Bild']['y0'].append(row[2])
				dataDict['Bild']['y1'].append(row[3])
				dataDict['Bild']['y2'].append(row[4])
			elif int(row[0]) == 277:
				dataDict['Lauwersoog']['x'].append(i)
				dataDict['Lauwersoog']['y0'].append(row[2])
				dataDict['Lauwersoog']['y1'].append(row[3])
				dataDict['Lauwersoog']['y2'].append(row[4])
			elif int(row[0]) == 380:
				dataDict['Maastricht']['x'].append(i)
				dataDict['Maastricht']['y0'].append(row[2])
				dataDict['Maastricht']['y1'].append(row[3])
				dataDict['Maastricht']['y2'].append(row[4])

# outfile name
json_file = 'data_KNMI_.json'

# dump data into the outfile
with open(json_file, 'w') as outfile:
    outfile.write(json.dumps(dataDict))