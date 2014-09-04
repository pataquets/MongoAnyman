
function RecordController($scope, $location,mongoDB) {
    $scope.mongoDB = mongoDB;
    $scope.callcount = 0;
    
    //If this is loaded first then reroute
    if(mongoDB.searchList.length == 0)
    {
        mongoDB.loadSearchList();
    }
    
    $scope.showResults = function()
    {
        $location.path('/view/results');
    }
    
    $scope.newSearch = function()
    {
        
        $location.path('/view/query');
        mongoDB.queryID=0;
        $location.search({})
    }
    
    $scope.nextRecord = function () 
    {
        if(mongoDB.resultStart==-1 ) return; //No cached results page
    
        
        var newRecNo = mongoDB.currentRecordNo + 1

        if (newRecNo <= mongoDB.totalRecs) {
            $location.search({cr:newRecNo,qi:mongoDB.queryID,sp:JSON.stringify(mongoDB.queryTerms)})
        }
    }
    
    $scope.previousRecord = function () {
          if(mongoDB.resultStart==-1 ) return; //No cached results page
    
        
        var newRecNo = mongoDB.currentRecordNo -1

        if (newRecNo >=0) {
            $location.search({cr:newRecNo,qi:mongoDB.queryID,sp:JSON.stringify(mongoDB.queryTerms)})
        }
    }
    
    $scope.isLink = function(key)
    {
        return mongoDB.getLinkDetails(key);
    }
    
    $scope.followLink = function( key, value)
    {
        linkDetails = mongoDB.getLinkDetails(key);
        console.log(linkDetails)
       
        var from = linkDetails['from']
        var newterms = {}
        newterms[from] = value;
        
        linksearch = mongoDB.getQueryIDFromName(linkDetails['tosearch'])

        $location.search({cr:0,qi:linksearch,sp:JSON.stringify(newterms)}).path('/view/results');
    
    }
    
    $scope.getType = function(data) {
        $scope.callcount++;
      
        obtype = Object.prototype.toString.call(data);
        sobtype = obtype.substring(8);
        sobtype = obtype.substring(8).substring(0, sobtype.length - 1);

        return sobtype;
    };
}