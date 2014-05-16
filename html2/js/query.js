
function QueryController($scope, mongoDB, $location) {
    $scope.mongoDB = mongoDB;
    

    $scope.doNewSearch = function() {

        $location.search({terms:JSON.stringify(mongoDB.queryTerms),search:mongoDB.queryID})
        $location.path('/view/results')
    }
}
