
function ResultsController($scope, $location, mongoDB) {
    $scope.mongoDB = mongoDB;
    
    //If this is loaded first then reroute
    if(mongoDB.searchList.length == 0)
    {
        $location.path('/view/query');
    }
    
    $scope.selectRecord = function(which) {
        mongoDB.fetchRecord(which)
        $location.path('/view/record')
    }
    
    $scope.nextPage = function() {
        //Get the current page
        //Add some to it
        //Call results with that
        var searchParams = {};
        searchParams["terms"] = JSON.stringify(mongoDB.queryTerms);
        searchParams["search"] = mongoDB.queryID;
        searchParams["recordno"] = mongoDB.currentRecordNo + mongoDB.pageSize
        $location.search(searchParams)
        mongoDB.getCurrentResultsPage()
        $scope.apply()
    }
    
    $scope.previousPage = function() {
        mongoDB.previousPage()
    }
    
    $scope.newSearch = function() {
        $location.path('/view/search')
    }
}