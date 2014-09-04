import MySQLdb.cursors
import pymongo

#This is a very slow and simplistic way of doing this

def get_subrec( table, fromcol, fromval,subreccursor,fields):
    if fields != None:
        query = "select {0} from {1} where {2} = {3}".format(fields,table,fromcol,fromval);
        #print query;
    else:
        query = "select * from " + table + " where " + fromcol + " = {0}".format(fromval);
   
    subreccursor.execute(query)
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
                     cursorclass=MySQLdb.cursors.SSDictCursor)
db2 = MySQLdb.connect(db=database, host="localhost",
                     port=3306, user="root", passwd="",
                     cursorclass=MySQLdb.cursors.SSDictCursor)

metacursor = db.cursor()
metacursor.execute(" select table_name from information_schema.columns where TABLE_SCHEMA='JMDB' and column_name='movieid' and table_name NOT LIKE '%%2%%' and table_name not like 'movies'")
tables = metacursor.fetchall()

moviecursor = db.cursor()
moviecursor.execute("set charset utf8") #MongoDB uses UTF-8 so lets get that back from MySQL

subreccursor = db2.cursor()
subreccursor.execute("set charset utf8") #MongoDB uses UTF-8 so lets get that back from MySQL


moviecursor.execute("select * from  " + toptable)

connection.imdb.data.drop();

#Get list of sub tables


count =0;
recs = []
for row in moviecursor:
    movieid = row.pop("movieid");
    row["_id"] = "m"+str(movieid);
    row["type"] = "production";
    for subtab in tables:
        tname = subtab["table_name"]
        sval = get_subrec(tname,"movieid",movieid,subreccursor,None)
        if sval :
            row[tname] = sval
    #Add links
    tname = "movies2actors left join actors using (actorid)"
    links = get_subrec(tname,"movieid",movieid,subreccursor,'movies2actors.movieid,movies2actors.as_character,CONCAT("a",movies2actors.actorid) as actorno,actors.name')
    if links :
        row['actors'] = links
            
    recs.append((row))
    
    if count % 1000 == 0:
        print count
        connection.imdb.data.insert(recs)
        recs = []
        
    count = count + 1
    
  
