angular.module('myApp.layout', [])
.controller('LayoutCtrl', ['userAuthService', '$scope', '$location', function(userAuthService, $scope, $location) {
    
    $scope.welcomeMessage = '';
    
    $scope.logout = function() {
      
      userAuthService.logout();
      $location.path('/');
    }
  
    $scope.getWelcomeMessage = function() {
       var last_name = '';
      userAuthService.getUserData().then(function(response){
        if(response.last_name!=null)
          last_name = response.last_name;
        $scope.welcomeMessage = 'Welcome '+response.first_name + ' ' + last_name + '!';
      });
      
      return $scope.welcomeMessage;
    }
}]);