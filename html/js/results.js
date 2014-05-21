
function ResultsController($scope, $location, mongoDB) {
    $scope.mongoDB = mongoDB;
    
    //If this is loaded first then reroute
    if(mongoDB.searchList.length == 0)
    {
        $location.path('/view/query');
    }
    
    //On a click work out what we need to do
    $scope.selectRecord = function(which) {
        if(mongoDB.searchList[mongoDB.queryID].aggregate)
        {
           
            //Get the parameters we used to get here
            var newterms = mongoDB.queryTerms
            
            //Add the id from 'which'
            var id = mongoDB.resultSet[which]['_id'];
            newterms['RecordID'] = id;
            //call the drilldown search
            var drilldown = mongoDB.searchList[mongoDB.queryID].drilldown
          
            mongoDB.setQueryIDByName(drilldown)
            mongoDB.doNewSearch(newterms)
            return;
        }
        if(mongoDB.fetchRecord(which))
        {
            $location.path('/view/record')
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
        mongoDB.nextPage()
    }
    
    $scope.previousPage = function() {
        mongoDB.previousPage()
    }
    
    $scope.newSearch = function() {
        $location.path('/view/search')
    }
}