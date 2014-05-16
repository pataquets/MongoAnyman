import MySQLdb.cursors
import pymongo

    
    
database = "jmdb"
toptable = "movies2actors"

connection = pymongo.MongoClient("localhost:27017")

db = MySQLdb.connect(db=database, host="localhost",
                     port=3306, user="root", passwd="",
                     cursorclass=MySQLdb.cursors.DictCursor)

personcursor = db.cursor()
personcursor.execute("set names utf8") #MongoDB uses UTF-8 so lets get that back from MySQL

personcursor.execute("select * from  " + toptable)
subreccursor = db.cursor()
 

count =0
recs = []


for row in personcursor.fetchall():
    recs.append(row)
    if count % 1000 == 0:
        print count
        connection.imdb.links.insert(recs)
        recs = []
        
    count = count + 1
