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
		.then(function(response){
			$scope.swims = response.data;
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
	$scope.loading = false;
	$scope.allowSave = false;
	
	$http.get('/api/employees')
		.then(function(response){
			$scope.employees = response.data;
			
		}, function(response){
			alert('Whoops');
		});
		
	$scope.$watch('employees', function(swims){
		$scope.data = angular.toJson(swims, true);
	}, true);
	
	$scope.addEmployee = function() {
		$scope.employees.push({});
	};
	
	$scope.removeEmployee = function(index) {
		if(typeof $scope.employees[index].id !== 'number')
			return $scope.employees.splice(index, 1);
		
		$scope.loading = true;
		
		var employee = $scope.employees[index];
		
		$http.post('/api/employee/remove', employee)
		.then(function(response){
			$scope.employees.splice(index, 1);
			$scope.loading = false;
		}, function(response){
			$scope.loading = false;
			alert('Whoops');
		});
	}
	
	$scope.saveEmployees = function() {
		if(!$scope.allowSave)
		{
			return;
		}
		
		$scope.loading = true;
		
		$http.post('/api/employees', {employees: $scope.employees})
		.then(function(response){
			$scope.employees = response.data;
			$scope.loading = false;
		}, function(response){
			$scope.loading = false;
			alert('Whoops');
		});
	};
	
	$scope.updateEmployee = function(index) {
		$scope.loading = true;
		
		var employee = $scope.employees[index];
		
		$http.post('/api/employee', employee)
		.then(function(response){
			$scope.employees[index] = response.data;
			$scope.loading = false;
		}, function(response){
			$scope.loading = false;
			alert('Whoops');
		});
	};
}]);

swimApp.controller("swim404Controller", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
	$scope.error = {
		code: 404,
		message: "Page not found: " + $location.path()
	}
}]);