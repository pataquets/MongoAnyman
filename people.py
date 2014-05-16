import MySQLdb.cursors
import pymongo
from pprint import  pprint

def is_integer(s):
    try:
        int(s)
    except ValueError:
        return False
    return True


def get_subrec( table, fromcol, fromval,subreccursor,fields=None):
    
    if isinstance(fromval,int) or fromval.isdigit():
        quote = ""
        #print fromval
    else:
        quote = "'"
        fromval = fromval.replace("'","\\'");
        
    if fields != None:
        query = "select {0} from {1} where {2} = {4}{3}{4}".format(fields,table,fromcol,fromval,quote);
        #print query;
    else:
        query = "select * from " + table + " where " + fromcol + " = {1}{0}{1}".format(fromval,quote);
   
    #print query
    try:
        subreccursor.execute(query)
    except:
        print "PROBLEM:" + query
        
    colset = subreccursor.fetchall();
    vallist = []
    if colset:
        for s in colset:
            del s[fromcol]
            if len(s) == 1:
                vallist.append(s.values()[0])
    if len(vallist):
        return vallist
    else:
        return colset
    
    
database = "jmdb"
toptable = "actors"

connection = pymongo.MongoClient("localhost:27017")

db = MySQLdb.connect(db=database, host="localhost",
                     port=3306, user="root", passwd="",
                     cursorclass=MySQLdb.cursors.DictCursor)

personcursor = db.cursor()
personcursor.execute("set names utf8") #MongoDB uses UTF-8 so lets get that back from MySQL

personcursor.execute("select * from  " + toptable)
subreccursor = db.cursor()
 
connection.imdb.people.drop();
count =0
recs = []

for row in personcursor.fetchall():
    actorid = row.pop("actorid");
    row["_id"] = "a"+str(actorid);
    row["type"] = "person;"
    row["aka"] = get_subrec("akanames","name",row["name"],subreccursor)
    row["biography"] = get_subrec("biographies","bioid",actorid,subreccursor)
    
    #Add links
    tname = "movies2actors left join movies using (movieid)"
    links = get_subrec(tname,"actorid",actorid,subreccursor,'movies2actors.actorid,movies2actors.as_character,CONCAT("m",movies2actors.movieid) as movieno,movies.title')
    if links :
        row['actors'] = links
            
    #pprint(row)
    recs.append(row)
    if count % 1000 == 0:
        print count
        connection.imdb.people.insert(recs)
        recs = []
        
    count = count + 1
