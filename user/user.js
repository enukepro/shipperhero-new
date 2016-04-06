'use strict';

var userApp = angular.module('myApp.user', ['ngRoute'])

userApp.config(['$routeProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $httpProvider, $locationProvider) {
    
  $locationProvider.html5Mode(true); 
  $routeProvider.when('/', {
    templateUrl: 'user/index.html',
    controller: 'UserCtrl'
  }).when('/myprofile', {
  	templateUrl: 'user/profile.html',
  	controller: 'ProfileCtrl'
  });
  
  //intercept response to retrieve the supplied access tokens 
  $httpProvider.interceptors.push('retrieveTokens');

  //intercept requests to set the access tokens 
  $httpProvider.interceptors.push('setTokens');
}]);

/** Request & Response interceptors **/

userApp.factory('setTokens', ['userAuthService', function(userAuthService) {
    
    var requestInterceptor = {
      
        request: function(config) {
            
            //if(config.headers['Content-Type'] !== undefined && config.headers['Content-Type'].indexOf('application/json') !== -1){
              
              var headers = userAuthService.getAuthenticationHeader();
              
              if(headers) {
                
                angular.forEach(headers, function(value, key){
                  
                  config.headers[key] = value;
                });
              }
            //}
            
            return config;
        }
    }

    return requestInterceptor;
}]);

userApp.factory('retrieveTokens', ['userAuthService', '$location', '$q', 'notificationService', function(userAuthService,  $location, $q, notificationService) {
    
    var responseInterceptor = {
        response: function(response) {
            
            //if(response.headers()['content-type'] !== undefined && response.headers()['content-type'].indexOf('application/json') !== -1){
              
              if(response.headers()['access-token']) {
                
                userAuthService.setAuthenticationHeader({
                  'Access-Token': response.headers()['access-token'],
                  'Client': response.headers()['client'],
                  'Expiry': response.headers()['expiry'],
                  'Uid': response.headers()['uid']
                });
              }else if($location.search()['access-token']) {
                
                userAuthService.setAuthenticationHeader({
                  'Access-Token': $location.search()['access-token'],
                  'Client': $location.search()['client'],
                  'Expiry': $location.search()['expiry'],
                  'Uid': $location.search()['uid']
                });
              }
            //}
            
            return response;
        },
        responseError: function(response) {
          
          //redirect to login page if user is not authorized
          
          if(response.status === 401){
              
              if($location.path().split("/")[1] != 'login') {
                
                notificationService.setMessage('authorizationError', 'Your session has expired. Please login again.');
                $location.path('/login');
              }
          }
          
          return $q.reject(response);
        }
    }

    return responseInterceptor;
}]);

/** Request & Response interceptors ends **/

userApp.controller('UserCtrl', ['userAuthService', '$uibModal','$scope', '$location', 'notificationService', '$window', function(userAuthService,$uibModal, $scope, $location, notificationService, $window) {
    $scope.user = {first_name:'', last_name:'', email:'', alt_email:'', password:'', password_confirmation:'', about:'', mc_num:'', user_type:''};
    $scope.signin = {email: '', password: '', remember_me: false};
    $scope.errors = {};
   
    $scope.login = function() {
      console.log("login");
      $scope.clearErrors();
      userAuthService.login($scope.signin).success(function(data){
        //notificationService.setMessage('success', 'Login Successful!'); 
        if(data.message == 'shipper')
          $location.path('/myprofile');
        else
           $location.path('/carrier-dashboard');
      }).error(function(data, response){    
        notificationService.setMessage('error', 'Invalid email or password!');
      });
    }
    
    $scope.singup = function() {
      $scope.clearErrors();
      userAuthService.register($scope.user)
      .success(function(data){        
        notificationService.setMessage('success', 'Please check your email for a verification link.');
        $location.path('/login');
      })
      .error(function(data, response) {        
        var errors = {};
        angular.forEach(data.text, function(value, key) { 
          errors[key] = value.join(', ');
        });        
        $scope.errors = errors;
      });
    }
    
    $scope.clearErrors = function() {      
      $scope.errors = {};
    }
    
    
    $scope.goToProfile = function() {
      
      //$location.url($location.path());
      $location.url('/myprofile');
    }
}]);

userApp.controller('ProfileCtrl', ['userAuthService', '$scope', '$location', 'notificationService', '$window', '$uibModal', function(userAuthService, $scope, $location, notificationService, $window, $uibModal) {
    $scope.user = {};
    $scope.address = {};
    var modalInstance;
    
    userAuthService.getUserData().then(function(response) {
      
      $scope.user = response;

      $scope.address = angular.isDefined($scope.user['user_address']) ? $scope.user.user_address : {};
    });
    
    $scope.open = function() {
      
      modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'user/popup/edit.html',
        controller: 'ProfileEditModalCtrl'
      });
      
      //if modal data has been saved
      modalInstance.result.then(function () {
        
        userAuthService.getUserData(true).then(function(response) {

          $scope.user = response;
          $scope.address = angular.isDefined($scope.user['user_address']) ? $scope.user.user_address : {};
        });
      });
    }
}]);
userApp.controller('ProfileEditModalCtrl', function($scope, $uibModalInstance, zipSearch,userAuthService, notificationService, $http, formDataStorageService){
  
  $scope.user = {};
  $scope.data = {};
  $scope.errors = {};
  $scope.select_roles = [
        { label: 'Carrier', value: 'carrier'},
        { label:'Shipper', value: 'shipper'},
        { label: 'Broker', value: 'broker'},
        { label: 'Broker / Carrier', value: 'broker,carrier'}
    ];
  userAuthService.getUserData().then(function(response) {

    angular.copy(response, $scope.user);
    angular.copy(response.user_address, $scope.data);
    
    //setup job_roles
    $scope.user.job_roles = $scope.user.job_roles.join(',');
  });
  
  $scope.close = function() {

    $uibModalInstance.dismiss();
  }
  $scope.error = '';
  $scope.errorZip = '';
  $scope.getCityState = function() {
      var responseData = zipSearch.search($scope.data.zip_code).success(function(response) {
              $scope.data.city = response.result.city;
              $scope.data.state = response.result.state;
              $scope.error = '';
          }).error(function(data, response) {
              $scope.error='Invalid Zip';
              $scope.data.city = '';
              $scope.data.state = '';
          });
}
  $scope.save = function() {

  //clear form errors
    //$scope.clearErrors();
    
    if(angular.isDefined($scope.user['job_roles']))
      $scope.user.job_roles = $scope.user.job_roles.split(',');
    
    userAuthService.updateProfile($scope.user)
    .success(function(data){

      notificationService.setMessage('success', 'Profile updated successfully!');
      //this triggers refreshing the user profile data
      $uibModalInstance.close();
      //$location.path('/myprofile');
    })
    .error(function(data, response) {

      var errors = {};
      angular.forEach(data.text, function(value, key) {

        //console.log(value, key);
        //console.log(key);
        errors[key] = value.join(', ');
      });

      $scope.errors = errors;
    });
  }
  
  $scope.saveAddress = function() {
    
    var processedData = formDataStorageService.urlEncodedData(angular.extend($scope.data, {type: 'UserInfo'}), 'address_info[', ']=');
    var promise;
    
    if(angular.isDefined($scope.data['id'])) {
      
      promise = $http.patch(baseUrl+'api/v1/address_infos/'+ $scope.data.id +'.json', processedData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });
    }
    else {
      
      promise = $http.post(baseUrl+'api/v1/address_infos.json', processedData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });      
    }
      
    promise
    .success(function(data){

      notificationService.setMessage('success', 'Address updated successfully!');
      //this triggers refreshing the user profile data
      $uibModalInstance.close();
      //$location.path('/myprofile');
    })    
    .error(function(data, response){
      
      if(angular.isDefined(data['text']) && data.text.length === 1)
        $scope.errors['addressError'] = data.text[0];
      else
        $scope.errors['addressError'] = 'There are errors on this page. Please correct.';
    }); 
  }
});


/******************************
Controller Name :- EmailConfirmation
Description:- This controller is used to confirm email address
*******************************/

userApp.controller('EmailConfirmation',  ['$scope', '$http','$location', '$routeParams','formDataStorageService','notificationService', function ($scope, $http,$location,$routeParams,formDataStorageService,notificationService) {
  var absUrl = $location.absUrl();
  var value = absUrl.split('?');
  var param = value[1].split('&');
  param = param.join('&');
   $http.get(baseUrl+'auth/confirmation.json?'+param).success(function(data){
      console.log(data);
      notificationService.setMessage('success', 'Email confirmed!');
       $location.path('/login');
    }).error(function(response) {
       notificationService.setMessage('error', 'Email could not confirmed!');
    }); 
}]);

/******************************
Controller Name :- UserModalCtrl
Description:- This controller is used login nad sign up purpose
*******************************/

userApp.controller('UserModalCtrl', ['$scope','$uibModalInstance', '$http','$uibModal', 'notificationService', function ($scope,$uibModalInstance, $http,$uibModal, notificationService) {
  $scope.close = function() {
    $uibModalInstance.dismiss();
  }

}]);