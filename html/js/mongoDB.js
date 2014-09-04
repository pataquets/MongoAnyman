//This has very, very little caching
//It simplifies things if we don't try to keep anything cached yet
"use strict";

aMongoIntel.service('mongoDB', function($http, $timeout,$location, $rootScope) {
    var me = this; // Let's us get easy access inside async callbacks where
    // this has changed
    // I Use this consistently instead of mixing with 'this'

    // Config Parameters
    this.pageSize = 10;

    // Temporary variables - Angular related or otherwise

    this.cachedOptions = {}
    this.currentRecordJSON = {};
    this.resultPage = []; // This is cached to avoid Angular issues
    this.resultStart = -1; // Info on what's cached
    this.lastUpdate = [ 1 ]; // Hack to get Angular to re render some things
    this.totalRecs = 999999; // We don't know initially
    this.searchList = [];
    this.resultSet = [] // The last page fetched

    
    // State Variables
    this.currentRecordNo = 0 // What record or page we are looking at
    this.queryID = 0
    this.queryTerms = {}



    // Reset everything and do a new search - for now we will
    // have a single search in play at one
    // Time - no history of searches.

    this.doNewSearch = function( terms) {
        me.lastUpdate = [ 1 ]; // Hack to get Angular to re render some things
        me.currentRecordNo = 0;
        me.currentRecordJSON = {}
        me.totalRecs = 999999; // We don't know initially
        // me.resultSet = []
        me.resultPage = []; // This is cached to avoid Angular issues
        me.resultStart = -1; // Info on what's cached
        me.queryTerms = JSON.parse(terms);
        me.queryJSON = terms; // As a string for comparison
        // Also work out what we are meant to be doing
    }

    // Return a view of the current page
    // This is a key function as it actually does the searches to get the data

    this.getCurrentResultsPage = function() {

        // Get parameters from URL is supplied
        var params = $location.search()
       console.log("oldQID=" +me.queryID)
        console.log("oldQJSON=" + me.queryJSON)
        if((params.qi && params.qi!=me.queryID )|| (params.sp && params.sp != me.queryJSON)) 
        {
            // If this is not the previous qi it's a new search
            me.doNewSearch(params.sp)
            me.queryID=params.qi;
            console.log("Changing search ")
        }

        if(params.cr != undefined) me.currentRecordNo=params.cr;
        console.log(params)
        
       // console.log("record " + me.currentRecordNo)
        var start = Math.floor(me.currentRecordNo / me.pageSize) * me.pageSize;
        var end = start + me.pageSize;

        // Return the current cache if we are viewing the same page
     //   console.log("START: " + start)
        
        if (start == me.resultStart) {
            console.log("Result cached: " + me.resultPage)

            return me.resultPage;
        }

    //    console.log("Terms: "+ me.queryTerms)
    //    console.log("QueryID: " + me.queryID)
//
        // Do we have the info for the cache? - if not we should fetch it


    //    console.log("Startat: " + start)
        angular.copy([], me.resultPage)
        $http({url : '/results',
            method: "GET",
            params: { queryID: me.searchList[me.queryID].name , start: start,
                page: me.pageSize, terms: me.queryTerms }                
        }).success(
                function(data) {
            //        console.log( "Start: " + start + " len: "+data.length)
                    if (data.length == 0 && start == 0) {
                        me.totalRecs = 0;
                        return;
                    }

                    angular.copy(data, me.resultPage)

                    if (data.length < me.pageSize) {
                        me.totalRecs = me.resultPage.length + start;
                    }

                    if (data.length == 0) {
                        me.currentRecordNo = start - 1;
                        me.resultStart = -1;
                        return
                    }
                })
    

    me.resultStart = start;
    // Always return a simple cached version for Angular
    // It only likes monitoring objects

    return me.resultPage;
}




this.getCurrentRecord = function()
{
    var params = $location.search()
    var id = params['id']

    if(id == undefined || (params.qi && params.qi!=me.queryID )|| (params.sp && params.sp != me.queryJSON))
    {
       var rp = me.getCurrentResultsPage();
       id = rp[me.currentRecordNo % me.pageSize]['_id']
       
    }
    
    
    console.log("Fetching record " + id)
    
    if( me.waiting || me.currentRecordJSON && me.currentRecordJSON['_id'] == id)
    {
        console.log("Cached")
        return [1]
    }
    
    
    me.queryID = params.qi
    me.queryJSON = params.sp
    me.currentRecordNo = params.cr
    
    
    //IF we've already requested then wait
    
    var drillDown = me.searchList[me.queryID].name;
  
    me.waiting = true;
    me.currentRecordJSON = {}
    $http({url : '/records',
        method: "GET",
        params: { queryID: drillDown , recordID:id }                
    }).success(function(data) {
        angular.copy(data, me.currentRecordJSON)
        me.waiting = false
        //Add ID to URL
        var s = $location.search()
        s['id'] = data['_id']
        $location.search(s)
        console.log("Retrieved form Server")
    })
    
    return [0]
}

// Retrieve the current record
this.fetchRecord = function(recno) {

    me.currentRecordNo = recno

    var id = me.resultSet[recno]['_id'];
    if(!id) {
        console.log("No ID")
        return false
    }

    // When I click on something from an aggregation
    // It may be a totally different query I want to do
    // I may not want a single record
    // It's more like following a link

    var drillDown = me.searchList[me.queryID].name;

    $http({url : '/records',
        method: "GET",
        params: { queryID: drillDown , recordID:id }                
    }).success(function(data) {
        angular.copy(data, me.currentRecordJSON)
        me.lastUpdate = [ 2 ]; // Angular force update hack
    })
    return true;
}

this.getLinkDetails = function(fieldname)
{
    // console.log(me.searchList[me.queryID])
    var links =  me.searchList[me.queryID]['links']

    for (var i = 0; i < links.length; i++) { 
        // console.log(links[i])
        if(links[i]['from'] == fieldname) return links[i]
    }
    return null
}

this.currentQueryArgs = function()
{
    if(me.searchList[me.queryID] && me.searchList[me.queryID].visible == true)
    {
        if(me.searchList[me.queryID].formorder)
        {
            return me.searchList[me.queryID].formorder
        }
        return me.searchList[me.queryID].args // Random
    }
    return {}
}


this.getQueryIDFromName = function(name)
{
    for (var i = 0; i < me.searchList.length; i++) { 
        if(me.searchList[i].name == name)
        {
            return i;
        }
    }
    console.log("Link to non existent")
}

this.getOptions = function(fname)
{
    if (me.cachedOptions[me.queryID + "-" + fname])
    {
        return me.cachedOptions[me.queryID + "-" + fname].options
    }

    var params = { 'fieldname':fname, queryID: me.searchList[me.queryID].name  }   

    //console.log(params)

    $http({url : '/options',
        method: "GET",
        params: params              
    }).success(function(data) {
       // console.log(data)
        angular.copy(data, me.cachedOptions[me.queryID + "-" + data.fieldname])
    })
    me.cachedOptions[me.queryID + "-" + fname] = {}
}

this.loadSearchList = function()
{
    // Fetch our list of searches from the server
    $http.get('/searches').success(
            function(data) { 
                me.searchList = data.searches 
              //  console.log(data)
            })
}

this.loadSearchList();

})