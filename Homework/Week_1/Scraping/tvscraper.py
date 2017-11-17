#!/usr/bin/env python
# Name: Rick van Bork
# Student number: 11990503
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''
import csv

from pattern.web import URL, DOM, plaintext, Element

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'

def extract_tvseries(dom):
    '''
    Extract a list of highest rated TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''
    # initialise dom element

    tv_data = []

    # loop over the div containing usefull IMDB info
    for n in dom('div[class="lister-item-content"]'):
        
        # start empty list
        series_data = []

        # all a tags nested in h3 tags, strip html, encode to byte string
        series_data.append((plaintext(n('h3 a')[0].content)).encode('utf8'))

        # all strong tags nested in div tags, strip html, encode to byte string
        series_data.append((plaintext(n('div strong')[0].content)).
            encode('utf8'))

        # search for genre class, strip html prettyprint & encode to byte string
        series_data.append(plaintext(n('span.genre')[0].content).strip('\n').
            encode('utf8'))

        # search for the runtime class, strip html, encode to byte string
        series_data.append((plaintext(n('span.runtime')[0].content)).
            encode('utf8'))

        actor_data = []

        # slice off first 12 of all a tags, strip html, encode to byte string
        for actor in n('a')[12:]:
            actor_data.append(plaintext(actor.content).encode('utf8'))

        # turn actor data list into 1 csv string for csv conformity
        series_data.append(", ".join(actor_data))

        # append data of one series
        tv_data.append(series_data)

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.

    return tv_data  # replace this line as well as appropriate

def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest rated TV-series.
    '''
    writer = csv.writer(f)

    # write headers
    writer.writerow(['Title', 'Score', 'Genre(s)', 'Runtime', 'Actor(s)'])

    # write data
    for series in tvseries:
        writer.writerow(series)

    output_file.close()

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)