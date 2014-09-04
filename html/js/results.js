
function ResultsController($scope, $location, mongoDB) {
    $scope.mongoDB = mongoDB;
    
    //If this is loaded first then reroute
    if(mongoDB.searchList.length == 0)
    {
        mongoDB.loadSearchList();
        
        //$location.path('/view/query');
    }
    
    //On a click work out what we need to do
    $scope.selectRecord = function(which,id) {
        console.log(mongoDB.searchList)
         console.log("RECNO = " +which)
        if(mongoDB.searchList[mongoDB.queryID].aggregate)
        {
           
            //Get the parameters we used to get here
            var newterms = mongoDB.queryTerms
            
            newterms['RecordID'] = id;
            //call the drilldown search
            var drilldown = mongoDB.searchList[mongoDB.queryID].drilldown
            drilldown = mongoDB.getQueryIDFromName(drilldown)
            
            $location.path('/view/results')
            $location.search({cr:which,qi:drilldown,sp:JSON.stringify(newterms)})
     
        }
        
        else
        {
            //Get the ID of the record and pu that in the URL
            //Its a fallback so if we use the URL without the serarch we get the record
            $location.path('/view/record')
            $location.search({id:id,cr:which,qi:mongoDB.queryID,sp:JSON.stringify(mongoDB.queryTerms)})
           
        }
    }
    
    $scope.aggDrilldown = function( which )
    {
        
        linkDetails = mongoDB.getLinkDetails(key);
        console.log(linkDetails)
        //Set the appropriate search in mongoDB
        mongoDB.setQueryIDByName(linkDetails['tosearch'])
        var from = linkDetails['from']
        var q = {}
        q[from] = value;
        mongoDB.doNewSearch(q)
        $location.path('/view/results')
    }
    
    $scope.nextPage = function() {
        var newRecNo = mongoDB.currentRecordNo - (mongoDB.currentRecordNo % mongoDB.pageSize)
        + mongoDB.pageSize

        if (newRecNo <= mongoDB.totalRecs) {
            $location.search({cr:newRecNo,qi:mongoDB.queryID,sp:JSON.stringify(mongoDB.queryTerms)})
        }
    }
    
    $scope.previousPage = function() {
        var newRecNo = mongoDB.currentRecordNo - (mongoDB.currentRecordNo % mongoDB.pageSize)
        - mongoDB.pageSize

        if (newRecNo >= 0) {
            $location.search({cr:newRecNo,qi:mongoDB.queryID,sp:JSON.stringify(mongoDB.queryTerms)})
        }
    }
    
    $scope.newSearch = function() {
        $location.search({});
        $location.path('/view/search')
    }
}