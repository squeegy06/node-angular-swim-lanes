swimApp.controller("member", ["member", "group", "$scope", "$http", "$location", "$routeParams", 
function(member, group, $scope, $http, $location, $routeParams){
	$scope.loading = false;
	$scope.allowSave = true;
	$scope.groupid = $routeParams.groupid;
	$scope.member = {
		id: $routeParams.memberid,
		data: {}
	};
	$scope.isNew = true;
	$scope.tasks = [];
	
	$scope.loadMember = function(id){
		member.get(id).then(function(response){
			$scope.member = response;
		}, function(error){
			console.log(error);
		});
	};
	
	$scope.loadTasks = function(id){
		return false;
	};
	
	$scope.saveMember = function(){
		$scope.loading = true;
		
		if($scope.isNew === true) {
			//Create a new member.
			member.create($scope.member.data).then(function(newID){
				$scope.member.id = newID;
				$scope.isNew = false;
				
				group.addMember($scope.groupid, newID).then(function(success){
					//Done.
				}, function(error) {
					console.log(error);
				})
			}, function(error){
				console.log(error);
			}).finally(function(){
				$scope.loading = false;
			});
		}
		else {
			member.update($scope.member.id, $scope.member.data).then(function(success){
				group.addMember($scope.groupid, $scope.member.id).then(function(success){
					//Done.
				}, function(error) {
					console.log(error);
				})
			}, function(error){
				console.log(error);
			}).finally(function(){
				$scope.loading = false;
			});;
		}
	};
	
	//On page load, try to get the member if it's not a new member.
	if($scope.member.id)
	{
		$scope.isNew = false;
		$scope.loadMember($scope.member.id);
		$scope.loadTasks($scope.member.id);	
	}
	
	//For debugging.
	$scope.$watch('member', function(member){
		$scope.data = angular.toJson(member, true);
	}, true);
}]);