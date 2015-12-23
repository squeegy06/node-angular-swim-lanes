swimApp.factory('group', ['$http', function($http){
    
    var addMember = function(groupid, memberid) {
        return $http.put('/api/group/' + groupid + '/member/' + memberid)
			.then(function(response){
				return response.data;
			}, function(error){
                throw error.data.error;
			});
    };
    
    return {
        addMember: addMember
    }
}]);