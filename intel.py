from bson import Binary, Code, json_util
from bson.json_util import dumps
import json
import  re
import pymongo
from bottle import run,route,static_file,request,get,post
import datetime
#Basic HTML serving functions
connection_string = "mongodb://localhost:27017"
connection = pymongo.MongoClient(connection_string)
database = connection.demos

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

@route('/results/<query>/<first>')
def run_query_send_results(query,first):
    regex = re.compile(query)
    movies = database.movies.find({"title":regex},{"title":1}).skip(int(first)).limit(10);
    #return list(movies);
    return json.dumps(list(movies),cls=DateTimeEncoder)

@route('/movies/<movieid>')
def get_movie(movieid):
    movie = database.movies.find_one({"_id": int(movieid)});
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