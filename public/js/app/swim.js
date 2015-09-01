var swimApp = angular.module('swimApp', [
	"ngRoute",
	"dndLists",
	"720kb.datepicker"
]);

swimApp.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/', {
			templateUrl: 'partials/index',
			controller: "swimIndexController"
		}).
		when('/employees', {
			templateUrl: 'partials/employees',
			controller: "swimEmployeesController"
		}).
		otherwise({
			templateUrl: "partials/error",
			controller: "swim404Controller"
		});
		
		$locationProvider.html5Mode(true);
}]);

swimApp.controller("swimIndexController", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
	$http.get('/api/swims')
		.success(function(data, status){
			$scope.swims = data;
		});
		
	$scope.$watch('swims', function(swims){
		$scope.data = angular.toJson(swims, true);
	}, true);
	
	$scope.saveSwims = function() {
		console.log('saving swims');
	}
}]);

swimApp.controller("swimEmployeesController", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
	$http.get('/api/employees')
		.success(function(data, status){
			$scope.employees = data;
		});
		
	$scope.$watch('employees', function(swims){
		$scope.data = angular.toJson(swims, true);
	}, true);
	
	$scope.addEmployee = function() {
		$scope.employees.push({});
	};
	
	$scope.removeEmployee = function(index) { 
		$scope.employees.splice(index, 1);
	}
	
	$scope.saveEmployees = function() {
		console.log('saving employees');
		
		$http.post('/api/employees', {employees: $scope.employees});
	};
}]);

swimApp.controller("swim404Controller", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
	$scope.error = {
		code: 404,
		message: "Page not found: " + $location.path()
	}
}]);