
var aMongoIntel = angular.module('MongoIntel', [ 'ngRoute' ]);

// Set up our mappings between URLs, templates, and controllers
function intelRouteConfig($routeProvider) {
    $routeProvider.when('/view/query', {
        controller : QueryController,
        templateUrl : '/app/query.html'
    }).when('/view/results', {
        controller : ResultsController,
        templateUrl : '/app/results.html'
    }).when('/view/record', {
        controller : RecordController,
        templateUrl : '/app/record.html'

    }).otherwise({
        redirectTo : '/view/query'
    });
}
aMongoIntel.config(intelRouteConfig);
