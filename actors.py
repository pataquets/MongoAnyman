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
toptable = "actors"

connection = pymongo.MongoClient("localhost:27017")

db = MySQLdb.connect(db=database, host="localhost",
                     port=3306, user="root", passwd="",
                     cursorclass=MySQLdb.cursors.DictCursor)

actorcursor = db.cursor()
actorcursor.execute("set charset utf8") #MongoDB uses UTF-8 so lets get that back from MySQL

subreccursor = db.cursor()
subreccursor.execute("set charset utf8") #MongoDB uses UTF-8 so lets get that back from MySQL


actorcursor.execute("select * from  " + toptable)



#Get list of sub tables


count =0;
recs = []
for row in actorcursor.fetchall():
    actorid = row.pop("actorid");
    row["_id"] = "a"+str(actorid);
    row["aka"] = get_subrec("akanames","name",row["name"])
    row["biography"] = get_subrec("biographies","bioid",actorid)
    #Add links
    tname = "movies2actors left join movies using (movieid)"
    links = get_subrec(tname,"actorid",actorid,subreccursor,'movies2actors.actorid,movies2actors.as_character,CONCAT("m",movies2actors.movieid) as movieno,movies.title')
    if links :
        row['movies'] = links
            
    recs.append((row))
    
    if count % 1000 == 0:
        print count
        connection.imdb.data.insert(recs)
        recs = []
        
    count = count + 1
    
  
