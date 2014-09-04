
function QueryController($scope, mongoDB, $location) {
    $scope.mongoDB = mongoDB;
    
    $scope.terms = {}
    
    $scope.doNewSearch = function() {
        //mongoDB.doNewSearch($scope.terms)
        //Pass all required variables to the view

        $location.search({cr:0,qi:mongoDB.queryID,sp:JSON.stringify($scope.terms)})
        mongoDB.queryID=-1;
        $location.path('/view/results')
    }
}
