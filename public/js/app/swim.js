var swimApp = angular.module('swimApp', [
	"ngRoute",
	"dndLists",
	"720kb.datepicker"
]);

swimApp.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/', {
			templateUrl: 'partials/index',
			controller: "index"
		}).
		when('/team/:groupid?', {
			templateUrl: 'partials/group',
			controller: "team"
		}).
		when('/team/:groupid/member/:memberid?', {
			templateUrl: 'partials/member',
			controller: "member"
		}).
		otherwise({
			templateUrl: "partials/error",
			controller: "error"
		});
		
		$locationProvider.html5Mode(true);
}]);

swimApp.controller("index", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
}]);

swimApp.controller("error", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
	$scope.error = {
		code: 404,
		message: "Page not found: " + $location.path()
	}
}]);