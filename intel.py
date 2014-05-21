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
config_database = connection['demos']
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
    try:
        start = params['start']
        pagesize = params['page']
        queryID = params['queryID']
        terms = params['terms']
        termdict = json.loads(terms)
    except:
        return {}
    
    #aggregations have no summary
    try:
        summary = global_searches[queryID]['summary']
    except:
        pass
    
    mycollection = global_searches[queryID]['collection']
    mydb = global_searches[queryID]['database']
    mysearch = json.loads(global_searches[queryID]['query'])
    queryobject = build_query(mysearch,termdict)
    pprint(queryobject)
    mysummary = json.loads(summary)
    
    #Is it an aggregation?
    aggregate = None
    
    try:
        aggregate = global_searches[queryID]['aggregate']
    except:
            pass
        
    if aggregate:
        queryobject.append({"$skip":int(start)});
        queryobject.append({"$limit":int(pagesize)});         
        rval = connection[mydb][mycollection].aggregate(queryobject,cursor={})
        
        print "Aggregate"
    else:
        rval = connection[mydb][mycollection].find(queryobject,mysummary).skip(int(start)).limit(int(pagesize))
        
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
                    print "REGEX"
                    return mongo_re
                except:
                    print "BAD REGEX " + str(value)
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
                    if(query[1:2] == '#'):
                        print "Integer Placeholder - Filling"
                        try:
                            rval = int(params[query[2:]])
                        except:
                            rval = ""
                        return rval
                    else:
                        try:
                            rval = params[query[1:]]
                        except:
                            rval = ""
                        return rval
                else:
                    pprint(query)
                    return query
    else:
        pprint(query)
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
                    print "What is " + obj;
                    if(obj[1:2] == '#'):
                        d[obj[2:]] = "Int"
                        print "Numeric PLaceholder"
                    else:
                        d[obj[1:]] = "Str"
                        print "String Placeholder"
           
            
    

@route('/searches')
def get_searches():
    global global_searches
    searches = config_database.searches.find()
    #Don't want to send the actual query details to the client - it's a secret
    rsearches = [];
    for search in searches:
        #TODO Refactor
        s = {}
        s['name'] = search['_id'];
        s['description'] = search['description'];
        s['visible'] = search['visible'];
        try:
            s['aggregate'] = search['aggregate']
        except:
            pass
        try:
            s['drilldown'] = search['drilldown']
        except:
            pass

        placeholders = {}
        parse_out_placeholders(placeholders,json.loads(search['query']))
        s['args']=[]
        try:
            s['args'] = search['formorder']
        except:
            for p in list(placeholders.keys()):
                s['args'].append({'name':p,'type':placeholders[p]})
        #Links optional
        try:    
            s['links'] = search['links']
        except:
            pass
        global_searches[search['_id']] = search #Global hash
        rsearches.append(s)
              
    pprint(global_searches)    
    return {'searches':rsearches}


def safecast_integer(s):
    try:
        return int(s)
    except ValueError:
        return s

@route('/options')
def get_options():
    params = request.query.decode()
    queryID = params['queryID']
    fname = params['fieldname']
    mycollection = global_searches[queryID]['collection']
    database = global_searches[queryID]['database']
    options = connection[database][mycollection].distinct(fname);
    return { 'fieldname': fname, 'options': options}

@route('/records')
def get_record():
    params = request.query.decode()
    queryID = params['queryID']
    recordID = params['recordID']
    
    mycollection = global_searches[queryID]['collection']
    database = global_searches[queryID]['database']
    print "Record _id = " + recordID + " in " + mycollection;
    recordID = safecast_integer(recordID)
    
    movie = connection[database][mycollection].find_one({"_id": recordID});
    pprint(movie)
    return json.dumps(movie,cls=DateTimeEncoder)

@route('/app/js/<filename:path>')
def send_js(filename):
    return static_file(filename, root='./html/js')

@route('/app/<filename:path>')
def send_app(filename):
    return static_file(filename, root='./html')

@route('/static/<filename:path>')
def send_static(filename):
    return static_file(filename, root='./html')

run(host='0.0.0.0', port=8080,reloader=True)