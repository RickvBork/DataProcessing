from pattern.web import URL, DOM, plaintext

url = URL('http://www.reddit.com/top/')
dom = DOM(url.download(cached=True))

# list of elements
print(dom('div.entry')[:3])

for e in dom('div.entry')[:3]: # Top 3 reddit entries.\
    print("EEE: {}".format(e))
    for a in e('a.title')[:1]: # First <a class="title">.
            print("AAA: {}".format(a))
            print repr(plaintext(a.content))