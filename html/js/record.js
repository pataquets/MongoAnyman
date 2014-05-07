
function RecordController($scope, $location,mongoDB) {
    $scope.mongoDB = mongoDB;

    $scope.showResults = function()
    {
        $location.path('/view/results');
    }
    
    $scope.newSearch = function()
    {
        $location.path('/view/query');
    }
    
    $scope.nextRecord = function () {
        mongoDB.nextRecord();
    }
    
    $scope.previousRecord = function () {
        mongoDB.previousRecord();
    }
    
    $scope.getType = function(x) {
        obtype = Object.prototype.toString.call(x);
        sobtype = obtype.substring(8);
        sobtype = obtype.substring(8).substring(0, sobtype.length - 1);
        return sobtype;
    };
}