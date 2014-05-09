
function QueryController($scope, mongoDB, $location) {
    $scope.mongoDB = mongoDB;
    
    $scope.terms = {}
    
    $scope.doNewSearch = function() {
        mongoDB.doNewSearch($scope.terms)
        $location.path('/view/results')
    }
}
