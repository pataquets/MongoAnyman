import MySQLdb.cursors
import pymongo

#This is a very slow and simplistic way of doing this

def get_subrec( table, fromcol, fromval,subreccursor):

    subreccursor.execute("select * from " + table + " where " + fromcol + " = %s",(fromval,))
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
toptable = "movies"

connection = pymongo.MongoClient("localhost:27017")

db = MySQLdb.connect(db=database, host="localhost",
                     port=3306, user="root", passwd="",
                     cursorclass=MySQLdb.cursors.DictCursor)

moviecursor = db.cursor()
moviecursor.execute("set charset utf8") #MongoDB uses UTF-8 so lets get that back from MySQL

subreccursor = db.cursor()
subreccursor.execute("set charset utf8") #MongoDB uses UTF-8 so lets get that back from MySQL


moviecursor.execute("select * from  " + toptable)

connection.imdb.movies.drop();

#Get list of sub tables

metacursor = db.cursor()
metacursor.execute(" select table_name from information_schema.columns where TABLE_SCHEMA='JMDB' and column_name='movieid' and table_name NOT LIKE '%%2%%' and table_name not like 'movies'")
tables = metacursor.fetchall()
count =0;
recs = []
for row in moviecursor.fetchall():
    movieid = row.pop("movieid");
    row["_id"] = {"tp":"prod","id":movieid};
    for subtab in tables:
        tname = subtab["table_name"]
        sval = get_subrec(tname,"movieid",movieid,subreccursor)
        if sval :
            row[tname] = sval
   
    recs.append((row))
    
    if count % 1000 == 0:
        print count
        connection.imdb.data.insert(recs)
        recs = []
        
    count = count + 1
    
  
