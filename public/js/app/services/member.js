swimApp.factory('member', ['$http', function($http){
    
    var getMember = function(id) {
        return $http.get('/api/member/' + id)
			.then(function(response){
				return response.data;
			}, function(error){
                throw error.data.error;
			});
    };
    
    var createMember = function(data) {
        return $http.post('/api/member', {
            data: data
        })
			.then(function(response){
				return response.data;
			}, function(error){
                throw error.data.error;
			});
    };
    
    var deleteMember = function(id) {
        return false;
    };
    
    var updateMember = function(id, data) {
        return $http.put('/api/member/' + id, {
            data: data
        })
			.then(function(response){
				return response.data;
			}, function(error){
                throw error.data.error;
			});
    }
    
    return {
        get: getMember,
        create: createMember,
        delete: deleteMember,
        update: updateMember
    }
}]);