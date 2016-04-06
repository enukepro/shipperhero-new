
/** Zip code **/
var myAppServices = angular.module("myApp.services", []);

myAppServices.factory('zipSearch', function($http) {
  
  var factory = {};
  
  factory.search = function(zip) {
    
    return $http.post(baseUrl+'api/v1/users/get_address_by_zip.json', {'zip': zip});
  }

  return factory;
});
/** User registration and Login service **/
myAppServices.factory('userAuthService', function($injector, $window, $cookies, $q, $timeout) {
   var factory = {};
   var user = {};
   var _userRqSent = false;
   var authenticationHeaders = {};
   
   factory.register = function(data) {
      
      return $injector.get("$http").post(baseUrl+'auth.json', data).success(function(response){
        
      }).error(function(response) {
        
      });
   }
   
   factory.updateProfile = function(data) {
      
      return $injector.get("$http").patch(baseUrl+'auth.json', data).success(function(response){
        
      }).error(function(response) {
        
      });
   }   
   
   factory.login = function(data) {
      
      return $injector.get("$http").post(baseUrl+'auth/sign_in.json', data).success(function(response){
      });
   }
   
   factory.logout = function() {
      
      this.setAuthenticationHeader({});
      $cookies.put('_loggedinID', '');
      return true;
   }
   
   //retrieve logged in user's data
   factory.getUserData = function(freshReq) {
     
     freshReq = freshReq || false;
     
     //deliver user data from cache
     //console.log(freshReq);
     if(_userRqSent && !freshReq) {
       
        var deferred = $q.defer();
        
        $timeout(function() {
          
          deferred.resolve(user);
        },0,false);
        
        return deferred.promise;
     }
     
     _userRqSent = true;
     //setup current user id for quick access
      return $injector.get("$http").get(baseUrl+'api/v1/users/my.json').then(function(response){

        user = response.data;
        $cookies.put('_loggedinID', response.id);
        return user;
      });
   }
   
   //retrieve logged in user's address
   factory.getUserAddress = function() {
     
     //setup current user id for quick access
      return $injector.get("$http").get(baseUrl+'api/v1/address_infos/my_address.json').success(function(response){

       // console.log(response);
      });
   }   
   
   //set logged in user's data
   factory.setUserData = function(data) {
     
     if(angular.isObject(data))
      user = data;
     else
       throw new Error('Argument should be an object');
   }
   
   //check if user is logged in
   factory.isUserLoggedIn = function() {
     
     var auth = this.getAuthenticationHeader();
     
     if(angular.isDefined(auth['Access-Token']))
      return true;
    
     return false;
   }
   
   //set headers
   factory.setAuthenticationHeader = function(data) {
     
     authenticationHeaders = data;
     $cookies.putObject('_authenticationHeaders', data);
   }
   
   //get headers
   factory.getAuthenticationHeader = function() {
     
     if(!angular.isDefined(authenticationHeaders['access-token'])) {
       
       authenticationHeaders = $cookies.getObject('_authenticationHeaders') || {};
     }
      
     return authenticationHeaders;
   }
   
   return factory;
}); 

/** Notification Messages Service **/
myAppServices.factory('notificationService', function($filter, $rootScope) {
   var factory = {};
   var messages = [];
   var tempMessages = [];
   
   factory.setMessage = function(key, message) {
      messages = [];
      tempMessages = [];
      if(!this.hasMessage(key))
        messages.push({'key': key, 'message': message});
   }
   
   //Messages persist across all the pages, until they are closed manually
   factory.getMessage = function(key) {
     
     var obj = $filter('filter')(messages, {'key': key}, true);
     
     if(obj.length)
       return obj[0].message;
     
     return '';
   }
   
   //Messages appear on a page and get destroyed on other pages
   factory.getOneTimeMessage = function(key) {
     
     //check tempMessages first
     var obj = $filter('filter')(tempMessages, {'key': key}, true);
     
     if(obj.length)
       return obj[0].message;
     
     //check main messages if message not found in temp
     var obj = $filter('filter')(messages, {'key': key}, true);
     
     if(obj.length) {
       
      messages.splice(messages.indexOf(obj), 1);
      tempMessages.push(obj[0]);
      console.log( tempMessages);
      return obj[0].message;
     }
     
     return '';
   }
   
   factory.hasMessage = function(key) {
     
     if(this.getMessage(key))
       return true;
     
     return false;
   }
   
   factory.hasOneTimeMessage = function(key) {
     
     if(this.getOneTimeMessage(key))
       return true;
     
     return false;
   }
   
   factory.clearOneTimeMessages = function() {
     
     tempMessages = [];
   }
   
   factory.clearMessage = function(key) {
     
     var obj = this.getMessage(key);
     
     if(obj.length)
      messages.splice(messages.indexOf(obj), 1);
   }
   
   //listen to route changes to delete OneTime messages
    $rootScope.$on('$locationChangeStart', function(event, next, current) {

      factory.clearOneTimeMessages();
    });   
   
   return factory;
});

/** Multi Setp Form data Storage **/
myAppServices.factory('formDataStorageService', function($filter,$injector, $http,$window, $cookies) {
  
  var factory = {};
  var dataStore = [];
  var finalData = [];
  var editedData = [];
  var recordId = null;
  var shipmentId = null;
  var dataArray = [];
  var index = null;
  var hashkey = null;
  factory.setStepData = function(step, data) {  
	  
    dataStore.push({'step': step, 'data': data});// Push all form data into dataStore
  }
  
  factory.getStepData = function(step) {    
    var stepData = $filter('filter')(dataStore, {'step': step}, true);    
    if(stepData.length)
      return stepData[0].data;    
      return {};
  }
  factory.getAllStepData = function() {    
    var data = [];
    angular.forEach(dataStore, function(obj, v) {
	finalData.push({'data':obj});
	//console.log(dataStore);
//console.log(finalData);
    });    
    return finalData;
  }

  factory.getRecordId = function() { 
      return recordId;
  }
 factory.setRecordId = function(id) { 
      recordId = id;
  }
  factory.getIndex = function() { 
      return index;
  }
 factory.setIndex = function(id) { 
      index = id;
  }
 factory.getHashKey = function() { 
      return hashkey;
  }
 factory.setHashkey = function(hashKey) { 
      hashkey = hashKey;
  }
  factory.getSourceArray = function() { 
      return dataArray;
  }
 factory.setSourceArray = function(sourceArray) { 
     dataArray = sourceArray;
  }
  factory.getShipmentId = function() { 
      return shipmentId;
  }
 factory.setShipmentId = function(id) { 
      shipmentId = id;
  }
  factory.getEditedData = function() { 
      return recordId;
  }
  factory.propose = function(shipmentId,status) {
    //console.log(status);
    return $http.post(baseUrl+'api/shipments/'+shipmentId+'/set_status.json', {'status': status,'id': shipmentId});
  }
  factory.pause = function(shipmentId,status) {
    return $http.post(baseUrl+'api/shipments/'+shipmentId+'/set_status.json', {'status': status,'id': shipmentId});
  }
  factory.acceptProposal = function(proposalId,shipmentId,status) {
    return $http.post(baseUrl+'api/shipments/'+shipmentId+'/set_status.json', {'proposal_id': proposalId,'id': shipmentId,'status': status});
  }
   /***********
	Function Name : urlEncodedData
	Description : To process data into url encoded form
   ************/
  factory.urlEncodedData = function(data,prefix,suffix) {
    
  var enodededData = [];  
  
	angular.forEach(data, function(val, key) {
		enodededData.push(prefix+key+suffix+val);
	});
	return enodededData.join('&');
  }
  
  factory.clearStepData = function(step) {    
    var stepData = $filter('filter')(dataStore, {'step': step}, true);    
    //delete data[stepData.step]
  }  
  return factory;

});
