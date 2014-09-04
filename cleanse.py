
import  re
import pymongo

connection_string = "mongodb://localhost:27017"
connection = pymongo.MongoClient(connection_string)

daterange = re.compile('(....)-(....)')


count = 0
batch = []


for obj in connection.imdb.data.find({}):
    datefrom = None
    dateto = None
    try:
        del obj['imdbid']
    except:
        pass
    
    try:
        datefield = obj['year']
        m=daterange.match(datefield)
        if m:
            #print "Match range"
            try:                
                datefrom = int(m.group(1))
                dateto = int(m.group(2))
            except ValueError:
                #print "Value error"
                pass
        else:   
            try:
                datefrom = int(datefield)
                dateto = int(datefield)
            except ValueError: 
                pass
            
            obj['datefrom'] = datefrom
            obj['dateto'] = dateto
            #print "from "+str(datefrom) + "to "+str(dateto)
    except KeyError:    
            #print "Bad date " + datefield
            pass
    
    if obj['_id'][:1] == 'm': 
        obj['rectype'] = 'prod'
    else:
        obj['rectype'] = 'pers'
        
    batch.append(obj)
    count= count + 1
    if count % 1000 == 0:
        connection.imdb.data2.insert(batch);
        print count;
        batch = []



        