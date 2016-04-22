'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', [
  'ngRoute',
  'myApp.user',
  'myApp.version',
  'myApp.services',
  'ngMessages',
  'myApp.layout',
  'ngCookies',
  'ui.bootstrap',
  'oi.select',
  'angular-loading-bar'
]);

myApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    
  $locationProvider.html5Mode(true);

  //window.baseUrl = 'http://localhost:3000/'; // local api
  window.baseUrl = 'http://foxsoftware.herokuapp.com:80/';
  window.appUrl = 'http://logisticshero.com/';
   $locationProvider.html5Mode(true);  
   
  /*FacebookProvider.init('1230432736983291');*/
  
  $routeProvider.otherwise({
  	redirectTo: '/'
  });
  
  /*GooglePlusProvider.init({
      clientId: '284026896587-lrndkh9eidoh51gaq981kvmjsghc04du.apps.googleusercontent.com',
      apiKey: 'AIzaSyA16C22CHqaYTyBS4s-3qrRhJtN3jeX_qE',
      scopes:"https://www.googleapis.com/auth/userinfo.email"
   });*/
}])
.run(['$rootScope', 'notificationService', 'userAuthService', '$location', 'zipSearch', function ($rootScope, notificationService, userAuthService, $location, zipSearch) {
  
    //make notification service available to all views
    $rootScope.notificationService = notificationService;
    $rootScope.zipSearch = zipSearch;
    
    //load Linkedin script asynchronously
    /*(function()
    {
      var e = document.createElement('script');
      e.type = 'text/javascript';
      e.async = false;
      e.src = 'http://platform.linkedin.com/in.js?async=true';
      e.onload = function(){
        IN.init({
          api_key: '75o50t50dah5vk',
          //onLoad: 'onLinkedInLoad',
          //scope: 'r_basicprofile r_emailaddress r_fullprofile',
          authorize:true
        }); 
      };
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(e, s);
    })();*/
    
    //Login checks
    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      
        var publicPages = ['login', 'sign_up', 'success','confirmation','myprofile'];
      
        if(!userAuthService.isUserLoggedIn()){
            
            var _location = next.split('/');
            
            var page = _location[3].split('?');
            _location[3] = page[0];
            if(publicPages.indexOf(_location[3]) === -1 && _location[3]) {
              
              $location.path('/');
            }
        }
    });
}]);
