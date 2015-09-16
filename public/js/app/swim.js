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
		when('/group/:groupid', {
			templateUrl: 'partials/group',
			controller: "swimGroupController"
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

swimApp.controller("swimGroupController", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
	$scope.loading = false;
	$scope.allowSave = true;
	$scope.saveButton = 'Update Group Order';
	$scope.selected = null;
	$scope.groupid = $routeParams.groupid;
	
	$http.get('/api/group/' + $scope.groupid)
		.then(function(response){
			$scope.group = response.data;
			
		}, function(response){
			if(response.data.error)
				return alert(response.data.error);
				
			alert('Something went wrong.');
		});
		
	$scope.$watch('group', function(group){
		$scope.data = angular.toJson(group, true);
	}, true);
	
	$scope.addMember = function() {
		var newMember = {
			group: {}
		};
		newMember.group[$scope.groupid] = {
			rank: 0
		};
		
		$scope.group.push(newMember);
	};
	
	$scope.removeMember = function(index) {
		if($scope.group[index].id === undefined)
			return $scope.group.splice(index, 1);
		
		if(confirm('Are you sure you want to delete this member?'))
		{
			$scope.loading = true;
			
			var member = $scope.group[index];
			
			$http.post('/api/member?action=remove', {member: member})
			.then(function(response){
				$scope.group.splice(index, 1);
				$scope.loading = false;
			}, function(response){
				$scope.loading = false;
				if(response.data.error)
					return alert(response.data.error);
					
				alert('Something went wrong.');
			});
		}
	};
	
	$scope.updateGroupOrder = function() {
		for(var i = 0; i < $scope.group.length; i++) {
			$scope.group[i].group[$scope.groupid].rank = i;
		};
	};
	
	$scope.saveGroupOrder = function() {
		if(!$scope.allowSave)
		{
			return;
		}
		
		$scope.loading = true;
		
		var unsavedMembers = false;
		
		for(var i = 0; i < $scope.group.length; i++)
		{
			if($scope.group[i].id === undefined)
				unsavedMembers = true;
		}
		
		if(unsavedMembers)
		{
			$scope.loading = false;
			return alert('You must first save all new members before updating the group order.');
		}
		
		$http.post('/api/group/' + $scope.groupid + '?action=updateOrder', {members: $scope.group})
		.then(function(response){
			$scope.group = response.data;
			$scope.loading = false;
		}, function(response){
			$scope.loading = false;
			if(response.data.error)
				return alert(response.data.error);
				
			alert('Something went wrong.');
		});
	};
	
	$scope.updateMember = function(index) {
		$scope.loading = true;
		
		var member = $scope.group[index];
		
		if(member.id === undefined)
		{
			$http.post('/api/member?action=add', {member: member})
			.then(function(response){
				$scope.group[index] = response.data;
				$scope.loading = false;
			}, function(response){
				$scope.loading = false;
				if(response.data.error)
					return alert(response.data.error);
					
				alert('Something went wrong.');
			});
		}
		else
		{
			$http.post('/api/member?action=update', {member: member})
			.then(function(response){
				$scope.group[index] = response.data;
				$scope.loading = false;
			}, function(response){
				$scope.loading = false;
				if(response.data.error)
					return alert(response.data.error);
				console.log(response);
					
				alert('Something went wrong.');
			});
		}
	};
}]);

swimApp.controller("swim404Controller", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
	$scope.error = {
		code: 404,
		message: "Page not found: " + $location.path()
	}
}]);