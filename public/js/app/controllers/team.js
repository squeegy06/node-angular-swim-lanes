swimApp.controller("team", ["$scope", "$http", "$location", "$routeParams", 
function($scope, $http, $location, $routeParams){
	$scope.loading = false;
	$scope.allowSave = true;
	$scope.saveButton = 'Update Group';
	$scope.selected = null;
	$scope.groupid = $routeParams.groupid;
	$scope.group = [];
	
	$scope.refreshMember = function(index){
		$http.get('/api/member/' + $scope.group[index].id)
			.then(function(response){
				$scope.group[index] = response.data;
			}, function(error){
				if(error.data.error)
					console.log(error.data.error);
			});
	};
	
	$scope.refreshMembers = function(){
		for(var i = 0; i < $scope.group.length; i++){
			$scope.refreshMember(i);
		}
	};
	
	$http.get('/api/group/' + $scope.groupid)
		.then(function(response){
			for(var i = 0; i < response.data.length; i++){
				$scope.group.push({
					id: response.data[i]
				})
			}
		}, function(error){
			if(error.data.error)
				return alert(error.data.error);
		}).finally(function(){
			$scope.refreshMembers();
		});
		
	$scope.$watch('group', function(group){
		$scope.data = angular.toJson(group, true);
	}, true);
	
	$scope.addMember = function() {
		var newMember = {
			data: {}
		};
		
		$scope.group.push(newMember);
	};
	
	$scope.removeMember = function(index) {
		if($scope.group[index].id === undefined)
			return $scope.group.splice(index, 1);
		
		if(confirm('Are you sure you want to remove this member from the group?'))
		{
			$scope.loading = true;
			
			var member = $scope.group[index];
			
			$http.delete('/api/group/' + $scope.groupid + '/member/' + member.id)
			.then(function(response){
				$scope.group.splice(index, 1);
				$scope.loading = false;
			}, function(response){
				$scope.loading = false;
				if(response.data.error)
					return alert(response.data.error);
			});
		}
	};
	
	$scope.saveGroup = function() {
		if(!$scope.allowSave)
		{
			return;
		}
		
		$scope.loading = true;
		
		var unsavedMembers = false;
		
		for(var i = 0; i < $scope.group.length; i++)
		{
			$scope.group[i].rank = i;
			
			if($scope.group[i].id === undefined)
				unsavedMembers = true;
		}
		
		if(unsavedMembers)
		{
			$scope.loading = false;
			return alert('You must first save all new members before we can save the group.');
		}
		
		$http.put('/api/group/' + $scope.groupid, $scope.group)
		.then(function(response){
			$scope.loading = false;
		}, function(response){
			$scope.loading = false;
			if(response.data.error)
				return alert(response.data.error);
		});
	};
	
	$scope.updateMember = function(index) {
		$scope.loading = true;
		
		var member = $scope.group[index];
		
		if(member.id === undefined)
		{
			$http.post('/api/member', member)
			.then(function(response){
				$scope.group[index].id = response.data;
				$scope.loading = false;
			}, function(error){
				$scope.loading = false;
				if(error.data.error)
					return alert(error.data.error);
			});
		}
		else
		{
			$http.put('/api/member/' + member.id, member)
			.then(function(response){
				$scope.loading = false;
			}, function(error){
				$scope.loading = false;
				if(error.data.error)
					return alert(error.data.error);
			});
		}
	};
}]);