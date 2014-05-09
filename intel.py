from bson import Binary, Code, json_util
from bson.json_util import dumps
import json
import  re
import pymongo
from bottle import run,route,static_file,request,get,post
import datetime
import types
from pprint import  pprint

#Basic HTML serving functions
connection_string = "mongodb://localhost:27017"
connection = pymongo.MongoClient(connection_string)
database = connection.demos
global_searches = {}

from time import mktime


class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            encoded_object = obj.isoformat()
        else:
            encoded_object =json.JSONEncoder.default(self, obj)
        return encoded_object
    
@route('/')
def send_root():
    return static_file('index.html', root='./html')

@route('/results')
def run_query_send_results():
    params = request.query.decode()
    start = params['start']
    pagesize = params['page']
    queryID = params['queryID']
    terms = params['terms']
    termdict = json.loads(terms)
    summary = global_searches[queryID]['summary']
    mycollection = global_searches[queryID]['collection']
    mysearch = json.loads(global_searches[queryID]['query'])
    queryobject = build_query(mysearch,termdict)
    pprint(queryobject)
    mysummary = json.loads(summary)
    rval = database[mycollection].find(queryobject,mysummary).skip(int(start)).limit(int(pagesize))
    return json.dumps(list(rval),cls=DateTimeEncoder)



def build_query(query,params):
    if isinstance(query,dict):
        rval = {}
        for key in query.keys():
            #An object with $regex is a regular expression
            #TODO optional args
            value = build_query(query[key],params);
            if key == "$regex":
                try:
                    mongo_re=re.compile(value);
                    return mongo_re
                except:
                    return ""; #User passing in a regex may be incorrect
            else:
                rval[key] = value
        return rval;
    elif isinstance(query,list):
        rval = []
        for value in query:
            rval.append(build_query(value,params))
        return rval
    elif isinstance(query,basestring):
                if(query[:1] == '@'):
                    try:
                        rval = params[query[1:]]
                    except:
                        rval = ""
                    return rval
    else:
        return query
                    
def parse_out_placeholders(d,obj):
    if isinstance(obj,dict):
        for key in obj.keys():
            value = obj[key]
            parse_out_placeholders(d,value)
    elif isinstance(obj,list):
        for value in obj:
            parse_out_placeholders(d,value)
    elif isinstance(obj,basestring):
                if(obj[:1] == '@'):
                    d[obj[1:]] = True
           
            
    

@route('/searches')
def get_searches():
    global global_searches
    searches = database.searches.find()
    #Don't want to send the actual query details to the client - it's a secret
    rsearches = [];
    for search in searches:
        global_searches[search['_id']] = search #Global hash
        s = {}
        s['name'] = search['_id'];
        s['description'] = search['description'];
        placeholders = {}
        parse_out_placeholders(placeholders,json.loads(search['query']))
        s['args'] = list(placeholders.keys())
        rsearches.append(s)
        
    pprint(global_searches)    
    return {'searches':rsearches}


def safecast_integer(s):
    try:
        return int(s)
    except ValueError:
        return s
    
@route('/records')
def get_record():
    params = request.query.decode()
    queryID = params['queryID']
    recordID = params['recordID']
    
    mycollection = global_searches[queryID]['collection']
    print "Record _id = " + recordID + "in" + mycollection;
    recordID = safecast_integer(recordID)
    
    movie = database[mycollection].find_one({"_id": recordID});
    pprint(movie)
    return json.dumps(movie,cls=DateTimeEncoder)

@route('/app/js/<filename:path>')
def send_static(filename):
    return static_file(filename, root='./html/js')

@route('/app/<filename:path>')
def send_static(filename):
    return static_file(filename, root='./html')

@route('/static/<filename:path>')
def send_static(filename):
    return static_file(filename, root='./html')

run(host='0.0.0.0', port=8080,reloader=True)