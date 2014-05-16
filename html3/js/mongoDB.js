//This has very, very little caching
//It simplifies things if we don't try to keep anything cached yet
"use strict";

aMongoIntel.service('mongoDB', function($http, $timeout,$location, $rootScope) {
    var me = this; // Let's us get easy access inside async callbacks where this has changed
    this.pageSize = 10;
    this.currentQuery = 'test';
    this.lastUpdate = [ 1 ]; // Hack to get Angular to re render some things
    this.currentRecordNo = 0;
    this.currentRecordJSON = {};
    this.totalRecs = 999999; // We don't know initially
    this.resultSet = []
    this.resultPage = []; // This is cached to avoid Angular issues
    this.resultStart = -1; // Info on what's cached
    this.searchList = [];
    this.queryID = 0;
    
    //Fetch our list of searches from the server
    $http.get('/searches').success(
            function(data) { 
            me.searchList = data.searches 
            var keys = Object.keys(me.searchList);
            console.log(keys)
            me.queryID = keys[0]
            console.log(me.queryID)
            })
                
    // Reset everything and do a new search - for now we will
    // have a single search in play at one
    // Time - no history of searches.

    this.doNewSearch = function( terms) {
        me.lastUpdate = [ 1 ]; // Hack to get Angular to re render some things
        me.currentRecordNo = 0;
        me.currentRecordJSON = {}
        me.totalRecs = 999999; // We don't know initially
        me.resultSet = []
        me.resultPage = []; // This is cached to avoid Angular issues
        me.resultStart = -1; // Info on what's cached
        me.queryTerms = terms;
        // Also work out what we are meant to be doing
        
    }

    // Return a view of the current page
    // This is a key function as it actually does the searches to get the data

    this.getCurrentResultsPage = function() {

        var start = Math.floor(me.currentRecordNo / me.pageSize) * me.pageSize;
        var end = start + me.pageSize;

        // Return the current cache if we are viewing the same page
        if (start == me.resultStart) {

            return me.resultPage;
        }

        // Do we have the info for the cache? - if not we should fetch it
        
        if (start >= me.resultSet.length) {
            $http({url : '/results',
                method: "GET",
                params: { queryID: me.searchList[me.queryID].name , start: start,
                    page: me.pageSize, terms: me.queryTerms }                
            }).success(
                    function(data) {
                        if (data.length == 0 && start == 0) {
                            me.totalRecs = 0;
                            return;
                        }
                        
                        me.resultSet.push.apply(me.resultSet, data);
                        if (data.length < me.pageSize) {
                            me.totalRecs = me.resultSet.length;
                        }
                        
                        if (data.length == 0) {
                            me.currentRecordNo = start - 1;
                            me.resultStart = -1;
                            return

                        }
                        me.resultPage = me.resultSet.slice(start, end);
                        console.log(me.currentRecordNo)
                        me.fetchRecord(me.currentRecordNo);
                    })
        } else {
            me.resultPage = me.resultSet.slice(start, end);
        }

        me.resultStart = start;
        // Always return a simple cached version
        return me.resultPage;
    }

    
    //Jump current document forward to start of next page
    
    this.nextPage = function() {
        var newRecNo = me.currentRecordNo - (me.currentRecordNo % me.pageSize)
                + me.pageSize

        if (newRecNo <= me.totalRecs) {
            me.currentRecordNo = newRecNo;
            me.getCurrentResultsPage();
        }
    }

    //Jump current document forward to start of previous page

    this.previousPage = function() {
        var newRecNo = me.currentRecordNo - (me.currentRecordNo % me.pageSize)
                - me.pageSize
        if (newRecNo >= 0) {
            me.currentRecordNo = newRecNo;
        }
    }

    //Move back a single record
    
    this.previousRecord = function() {
 
        if (me.currentRecordNo > 0)
        {
            me.currentRecordNo--;
            me.fetchRecord(me.currentRecordNo);
        }
    }

    //Move forward a single record
    this.nextRecord = function() {
        
        if (me.currentRecordNo+1 == me.resultSet.length) {
            me.nextPage();
        }  else {
         me.currentRecordNo++;
         me.fetchRecord(me.currentRecordNo);
        }
    }

    //Retrieve the current record
    this.fetchRecord = function(recno) {
        
        me.currentRecordNo = recno
        var id = me.resultSet[recno]['_id'];
        //TODO add exception handler here
        
        $http({url : '/records',
            method: "GET",
            params: { queryID: me.searchList[me.queryID].name , recordID:id }                
        }).success(function(data) {
            angular.copy(data, me.currentRecordJSON)

            me.lastUpdate = [ 2 ]; // Angular update hack
        })
    }
    
    this.getLinkDetails = function(fieldname)
    {
       //console.log(me.searchList[me.queryID])
       var links =  me.searchList[me.queryID]['links']
     
       for (var i = 0; i < links.length; i++) { 
           //console.log(links[i])
           if(links[i]['from'] == fieldname) return links[i]
       }
       return null
    }
    
    this.setQueryIDByName = function(name)
    {
        for (var i = 0; i < me.searchList.length; i++) { 
            console.log(me.searchList[i])
            console.log(me.searchList[i].name + " ? " + name)
            if(me.searchList[i].name == name)
            {
                me.queryID = i;
                console.log("Query set to " + i)
                return;
            }
        }
        console.log("Link to non existent")
    }
    
})