
function QueryController($scope, mongoDB, $location) {
    $scope.mongoDB = mongoDB;
    
    $scope.doNewSearch = function() {
        mongoDB.doNewSearch()
        $location.path('/view/results')
    }
}
