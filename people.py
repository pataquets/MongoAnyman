import MySQLdb.cursors
import pymongo

def get_subrec( table, fromcol, fromval):
    subreccursor = db.cursor()
    subreccursor.execute("select * from " + table + " where " + fromcol + " = %s",(fromval,))
    return subreccursor.fetchall();
    
    
database = "jmdb"
toptable = "actors"

connection = pymongo.MongoClient("localhost:27017")

db = MySQLdb.connect(db=database, host="localhost",
                     port=3306, user="root", passwd="",
                     cursorclass=MySQLdb.cursors.DictCursor)

personcursor = db.cursor()
personcursor.execute("set names utf8") #MongoDB uses UTF-8 so lets get that back from MySQL

personcursor.execute("select * from  " + toptable)

connection.imdb.people.drop();

for row in personcursor.fetchall():
    actorid = row.pop("actorid");
    row["_id"] = actorid;
    row["aka"] = get_subrec("akanames","name",row["name"])
    connection.imdb.people.insert(row)
    
