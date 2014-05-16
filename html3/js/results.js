
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
        mongoDB.nextPage()
    }
    
    $scope.previousPage = function() {
        mongoDB.previousPage()
    }
    
    $scope.newSearch = function() {
        $location.path('/view/search')
    }
}