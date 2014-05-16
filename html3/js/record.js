
function RecordController($scope, $location,mongoDB) {
    $scope.mongoDB = mongoDB;

    
    //If this is loaded first then reroute
    if(mongoDB.searchList.length == 0)
    {
        $location.path('/view/query');
    }
    
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
    
    $scope.isLink = function(key)
    {
        return mongoDB.getLinkDetails(key);
    }
    
    $scope.followLink = function( key, value)
    {
        linkDetails = mongoDB.getLinkDetails(key);
        
        //Set the appropriate search in mongoDB
        mongoDB.setQueryIDByName(linkDetails['tosearch'])
        var from = linkDetails['from']
        var q = {}
        q[from] = value;
        mongoDB.doNewSearch(q)
        $location.path('/view/results')
    }
    
    $scope.getType = function(data) {
       
        obtype = Object.prototype.toString.call(data);
        sobtype = obtype.substring(8);
        sobtype = obtype.substring(8).substring(0, sobtype.length - 1);

        return sobtype;
    };
}