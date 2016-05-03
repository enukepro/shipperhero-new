'use strict';

var rfpApp = angular.module('myApp.rfp', ['ngRoute', 'ui.bootstrap']);

rfpApp.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
   /** create rfp form steps **/
  .when('/new-rfp/:step?', {
          templateUrl: function(stepTemplate){
                        if(!angular.isDefined(stepTemplate.step))
                          return '/rfp/new/pickup-info.html';
                        
                        return '/rfp/new/' + stepTemplate.step + '.html';
                      },
          controller: 'RfpStepFormCtrl'
  })
   /** create rfp form steps end **/
  .when('/myrfp', {
        templateUrl: 'rfp/myrfp.html',
        controller: 'MyRfpCtrl'
  })
  .when('/draft',{
        templateUrl:'rfp/draft.html',
      	controller:'DraftRfpCtrl'

  })
  .when('/pending',{

       	templateUrl:'rfp/pending.html',
        controller:'PendingRfpCtrl'

  }).when('/viewall', {
    templateUrl: 'rfp/viewall.html',
    controller: 'ViewAllRfpCtrl'
  });
  }]);
/******************************
Controller Name :- MyRfpCtrl
Description:- Used to display all type of myrfp on dashboard
*******************************/

rfpApp.controller('MyRfpCtrl',  ['$scope', '$http','$window','$uibModal','$route', '$routeParams','formDataStorageService','notificationService',function ($scope,$http,$window,$uibModal,$route, $routeParams,formDataStorageService,notificationService) {
    
  $scope.drafts = {
    input: {limit: 5, status: 'draft'},
    data: []
  };
  
  $scope.myRfps = {
    input: {limit: 5, status: 'proposing'},
    data: []
  };  
  $scope.pending = {
    input: {limit: 5, status: 'pending'},// status =pending
    data: []
  };  
   //currently open row
  $scope.selected = null; 
  $scope.prevSelected = null;
  $scope.draftSelected = null; 
  $scope.prevDraftSelected = null;
  $scope.pendingSelected = null; 
  $scope.prevPendingSelected = null;
  var modalInstance;

  var retrieveData = function() {
      $http.get(baseUrl+'api/v1/shipments.json?limit='+$scope.myRfps.input.limit+'&status='+$scope.myRfps.input.status).success(function(data){
    
       $scope.myRfps.data = data.results;
    });  
  }

 var retrievDraftData = function() {
    $http.get(baseUrl+'api/v1/shipments.json?limit='+$scope.drafts.input.limit+'&status='+$scope.drafts.input.status).success(function(data){
    //console.log(data.results);
      $scope.drafts.data = data.results;
   });
  }

 var retrievPendingData = function() {
    $http.get(baseUrl+'api/v1/shipments.json?limit='+$scope.pending.input.limit+'&status='+$scope.pending.input.status).success(function(data){
    //console.log(data.results);
      $scope.pending.data = data.results;
   });
  }

  $scope.getDateObj = function(string) {
    
    return (new Date(string));
  }
  //detail of the row/item
  $scope.detailItem = {};

  //retrieve details of selected row
  var retrieveDetails = function(index) {
    $http.get(baseUrl+'api/v1/shipments/'+ $scope.myRfps.data[index].id+'.json').success(function(data){

      $scope.detailItem = data;
      $scope.bidData = data.proposals;
    });    
  }
var retrieveDraftDetails = function(index) {
    $http.get(baseUrl+'api/v1/shipments/'+ $scope.drafts.data[index].id+'.json').success(function(data){

      $scope.detailItem = data;
    });    
  }
var retrievePendingDetails = function(index) {
    $http.get(baseUrl+'api/v1/shipments/'+ $scope.pending.data[index].id+'.json').success(function(data){

      $scope.detailItem = data;
    });    
  }
  $scope.setVisible = function(index) {
    if($scope.prevSelected == index)
    {
       $scope.selected = null;
       $scope.prevSelected = null;
    }else{
      retrieveDetails(index);
      $scope.selected = index;
      $scope.prevSelected = index;
    }
  }  
  
  $scope.isVisible = function(index) {
    return $scope.selected == index ? true : false;
  }

  $scope.setDraftVisible = function(index) {
    if($scope.prevDraftSelected == index)
    {
       $scope.draftSelected = null;
       $scope.prevDraftSelected = null;
    }else{
      retrieveDraftDetails(index);
      $scope.draftSelected = index;
      $scope.prevDraftSelected = index;
    }
  }  
  
  $scope.isDraftVisible = function(index) {
    return $scope.draftSelected == index ? true : false;
  }

  $scope.setPendingVisible = function(index) {
    if($scope.prevDraftSelected == index)
    {
       $scope.draftSelected = null;
       $scope.prevDraftSelected = null;
    }else{
      retrievePendingDetails(index);
      $scope.pendingSelected = index;
      $scope.prevPendingSelected = index;
    }
  }  
  
  $scope.isPendingVisible = function(index) {
    return $scope.pendingSelected == index ? true : false;
  }

  $scope.open = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'rfp/edit.html',
        controller: 'RfpEditModalCtrl',
        size: 'lg'
      });
    }

// Open pause confirmation dialog box 

   $scope.postConfirmation = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/post_rfp.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }
    // Open pause confirmation dialog box 

   $scope.pauseConfirmation = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/pause_rfp.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }
 // Open delete confirmation dialog box 

   $scope.deleteConfirmation = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/delete_rfp.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }
  // Open modal for contact detail 

   $scope.contactDetail = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'shipments/contact_dialog.html',
        controller: 'ShipmentsmodalCtrl'
      });
    }

  $scope.acceptConfirmation = function(index,shipment_id) {
      var id = formDataStorageService.setRecordId(index);
      var id = formDataStorageService.setShipmentId(shipment_id);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/accept_bid.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }

  //default page data load
  retrieveData();
  retrievDraftData();
 retrievPendingData();
//End here
}]);

/******************************
Controller Name :- DraftRfpCtrl
Description:- Used to display all draft shipment 
*******************************/

rfpApp.controller('DraftRfpCtrl', ['$scope', '$http','$window','$uibModal','$route', '$routeParams','formDataStorageService','notificationService',function ($scope,$http,$window,$uibModal,$route, $routeParams,formDataStorageService,notificationService) {
 

  $scope.items = {
    input: {limit: 5, status: 'draft'},
    data: []
  };  
  
  //detail of the row/item
  $scope.detailItem = {};
  
  //currently open row
  $scope.selected = null;
  $scope.prevSelected = null;
  //page parameters to be initialized from request's response
  $scope.currentPage = 1;
  $scope.perPage = 5;
  $scope.totalItems = '';
  //page parameters end
  var modalInstance;
    
  var retrieveData = function() {
    
    $http.get(baseUrl+'api/v1/shipments.json?limit='+$scope.items.input.limit+'&status='+$scope.items.input.status+'&page='+$scope.currentPage).success(function(data){
      $scope.totalItems = data.total;
      $scope.items.data = data.results;
      //console.log($scope.items.data);
    });
  }
  
  //retrieve details of selected row
  var retrieveDetails = function(index) {
    
    $http.get(baseUrl+'api/v1/shipments/'+ $scope.items.data[index].id +'.json').success(function(data){

      $scope.detailItem = data;
    });    
  }
  
    // Open modal for edit shipment detail

   $scope.open = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'rfp/edit.html',
        controller: 'RfpEditModalCtrl',
        size: 'lg'
      });
    }

  $scope.getDateObj = function(string) {
    
    return (new Date(string));
  }
  
  $scope.pageChanged = function() {
    
    retrieveData();
  }
  
  $scope.setVisible = function(index) {
     if($scope.prevSelected == index)
    {
       $scope.selected = null;
       $scope.prevSelected = null;
    }else{
      retrieveDetails(index);
      $scope.selected = index;
      $scope.prevSelected = index;
    }
  }  
  
  $scope.isVisible = function(index) {
    
    return $scope.selected == index ? true : false;
  }

//open confirmation box for post RFP
  $scope.postConfirmation = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/post_rfp.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }

  // Open delete confirmation dialog box 

   $scope.deleteConfirmation = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/delete_rfp.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }
 
  //default page data load
  retrieveData();

}]);

/******************************
Controller Name :- PendingRfpCtrl
Description:- Used to display all pending shipment 
*******************************/

rfpApp.controller('PendingRfpCtrl',  ['$scope', '$http','$window','$uibModal','$route', '$routeParams','formDataStorageService','notificationService',function ($scope,$http,$window,$uibModal,$route, $routeParams,formDataStorageService,notificationService) {

$scope.items = {
    input: {limit: 5, status: 'pending'},// need to change status later status =pending
    data: []
  };  
  
  //detail of the row/item
  $scope.detailItem = {};
  
  //currently open row
  $scope.selected = null;

  //page parameters to be initialized from request's response
  $scope.currentPage = 1;
  $scope.perPage = 5;
  $scope.totalItems = '';
  //page parameters end
  var modalInstance;
    
  var retrieveData = function() {
    
    $http.get(baseUrl+'api/v1/shipments.json?limit='+$scope.items.input.limit+'&status='+$scope.items.input.status+'&page='+$scope.currentPage).success(function(data){
      $scope.totalItems = data.total;
      $scope.items.data = data.results;
      //console.log($scope.items.data);
    });
  }
  
  //retrieve details of selected row
  var retrieveDetails = function(index) {
    
    $http.get(baseUrl+'api/v1/shipments/'+ $scope.items.data[index].id +'.json').success(function(data){

      $scope.detailItem = data;
    });    
  }
  
    // Open modal for edit shipment detail

   $scope.open = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'rfp/edit.html',
        controller: 'RfpEditModalCtrl',
        size: 'lg'
      });
    }
  // Open modal for contact detail 

  $scope.contactDetail = function(index) {
     var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'shipments/contact_dialog.html',
        controller: 'ShipmentsmodalCtrl'
      });
  }
  // Open delete confirmation dialog box 

   $scope.deleteConfirmation = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/delete_rfp.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }
  $scope.getDateObj = function(string) {
    
    return (new Date(string));
  }
  
  $scope.pageChanged = function() {
    
    retrieveData();
  }
  
  $scope.setVisible = function(index) {
    retrieveDetails(index);
    $scope.selected = index;
  }  
  
  $scope.isVisible = function(index) {
    
    return $scope.selected == index ? true : false;
  }
   $scope.pauseRequest = function(index) {
    
      var responseData = formDataStorageService.pause(index,'pause').success(function(response) {
             notificationService.setMessage('success', 'Shipment paused');
              }).error(function(response) {
                 notificationService.setMessage('error', 'Shipment could not paused!');
              });  
  }  
  
   //Delete the shipment
   $scope.delete = function(index) {
   if ($window.confirm("Are you sure you want to delete?")) {
      $http.delete(baseUrl+'api/v1/shipments/'+index+'.json').success(function(data){
        notificationService.setMessage('success', 'Your shipment has been deleted!');
        $route.reload();
      }); 
    } else {
      //
    }
  }
  //default page data load
  retrieveData();

}]);

/******************************
Controller Name :- RfpStepFormCtrl
Description:- Used save multistep form data
*******************************/

rfpApp.controller('RfpStepFormCtrl', ['$scope', 'formDataStorageService', '$routeParams', '$location','$filter','$injector' ,'$http','userAuthService','zipSearch','$q','notificationService',function ($scope, formDataStorageService, $routeParams, $location,$filter,$injector,$http,userAuthService,zipSearch,$q,notificationService) {
    
    var steps = ['pickup-info', 'delivery-info', 'shipment-timing', 'shipment-info', 'tracking'];
    
    $scope.step = 0;
    $scope.data = {};
    $scope.status = {};
    $scope.formSubmitted = false;
    $scope.error='';
    //$scope.onlyAlphabets = "/^[a-zA-Z]]+$/";

 
  $scope.complete=function(companyValue){
   
    $scope.locations = [];
      if(companyValue!=undefined && companyValue!="" )
      {
      var processedData="place="+companyValue;
         $http.post(baseUrl+'api/v1/users/get_address.json?',processedData,{headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
             }).success(function(response) {
              $scope.locations=response.results;
                $scope.pickupCompany = response.results;
             }).error(function(error){
              alert(error);
             })
         
        //$scope.locations=$scope.locationData;
      }
      else
        $scope.pickupCompany="";
    };

$scope.getSelectedAddress=function(index){
  var address1="";
 $scope.pickupCompany="";
  if(index==undefined && index=="")
   return;
 else{
     $scope.selectedAddress=$scope.locations[index];
    if($scope.selectedAddress.name){
      address1 +=$scope.selectedAddress.name +"," ;
    $scope.data.company_name=$scope.selectedAddress.name;
    }
    if($scope.selectedAddress.street_number)
    address1 +=$scope.selectedAddress.street_number+" " ;
    if($scope.selectedAddress.street)
    address1 += $scope.selectedAddress.street+"," ;
    if($scope.selectedAddress.city){
      address1 += $scope.selectedAddress.city + "," ;
       $scope.data.city=$scope.selectedAddress.city;
    }
    if($scope.selectedAddress.state){
        address1 +=$scope.selectedAddress.state+" " ;
         $scope.data.state=$scope.selectedAddress.state;
    }
  
    if($scope.selectedAddress.postal_code){
       address1 +=  $scope.selectedAddress.postal_code +"," ;
        $scope.data.zip_code=$scope.selectedAddress.postal_code;
     }
    if( $scope.selectedAddress.country)
    address1 += $scope.selectedAddress.country +"," ;
    if( $scope.selectedAddress.formatted_phone_number)
    address1 += $scope.selectedAddress.formatted_phone_number;
    $scope.data.address1=address1;

   }
}
   
 //Setting default from and to time
    var from = new Date();
    from.setHours(8);
    from.setMinutes(0);
    var to = new Date();
    to.setHours(17);
    to.setMinutes(0);
    var appt = new Date();
    appt.setHours(11);
    appt.setMinutes(11);
    var consignee_hour_from = from;
    var consignee_hour_to = to;
    var shipper_hours_from = from;
    var shipper_hours_to = to;
    var mytime = appt;
    $scope.today = new Date();
    if(angular.isDefined($routeParams.step))
      $scope.step = steps.indexOf($routeParams.step);
    
    $scope.getNextStep = function() {
      
      return $scope.step + 1;
    }
  
    $scope.getNextStepUri = function() {
      
      var step = $scope.getNextStep();
      
      if(steps[step])
        return steps[step];
      
      return false;
    }
    
    $scope.getPrevStep = function() {
      
      return $scope.step - 1;
    }
    
    $scope.getPrevStepUri = function() {
      
      var step = $scope.getPrevStep();
      
      if(steps[step])
        return steps[step];
      
      return false;
    }
    
    $scope.getStep = function() {
      
      return $scope.step;
    }
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
    //handle next key press of form
    $scope.next = function($event) {
     // console.log(this.stepForm.$valid)
      $event.preventDefault();
      
      formDataStorageService.setStepData($scope.getStep(), $scope.data);
      //return if form is not valid
      $scope.formSubmitted = true;
      if(!this.stepForm.$valid)
        return;
      
      if($scope.getNextStepUri())
        $location.path('/new-rfp/'+$scope.getNextStepUri());
    }
    
    $scope.pickupdate_open = function($event) {
      $scope.status.opened = true;
    }
    
    $scope.deliverydate_open = function($event) {
      $scope.status.deliverydate_opened = true;
    }  
    $scope.rfpdate_open = function($event) {
      $scope.status.rfpdate_open = true;
    }   

    /***************
    Function Name : saveData
    Description : This function is called to save data.
    ****************/
    $scope.saveData = function() {
    var pickup_at_from = '';
    var pickup_at_to = ''; 
    var arrive_at_to = '';
    var arrive_at_from = '';
    var auction_end_at = '';

    var promise1 = $q.defer().promise;

    //default promise for step 2nd resolved to success
    var step2Differed = $q.defer(); 
        step2Differed.resolve('step2');
      
    var promise2 = step2Differed.promise;
    var allStepData = formDataStorageService.getAllStepData();
    var step = '';

//console.log('All step data', allStepData);

    angular.forEach(allStepData, function(obj) {
  
      step = obj.data.step;

      if(step == 0) {
        var shipper_id_or_promise = formDataStorageService.getStepData('shipper_info_id');
        if(!angular.isNumber(shipper_id_or_promise)) {
        
          var prefix = 'address_info[';
          var suffix = ']=';
          angular.extend(obj.data.data, {type: 'ShipperInfo', is_default: 'false'});
          var processedData = formDataStorageService.urlEncodedData(obj.data.data,prefix,suffix);// Function call for urlencoded data
      
          var shipper_id_or_promise = $injector.get("$http").post(baseUrl+'api/v1/address_infos.json', processedData, {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
               }).then(function(response) {
            formDataStorageService.setStepData("shipper_info_id", response.data.id);
            formDataStorageService.setStepData("pe", obj.data.data.del_num);
            });
        }

        promise1 = $q.when(shipper_id_or_promise);
      }
      else if(step == 1) {
        var delivery_id_or_promise = formDataStorageService.getStepData('receiver_info_id');

        if(!angular.isNumber(delivery_id_or_promise)) {
        
          var prefix = 'address_info[';
          var suffix = ']=';
          angular.extend(obj.data.data, {type: 'ReceiverInfo', is_default: 'false'});

          var processedData = formDataStorageService.urlEncodedData(obj.data.data,prefix,suffix);// Function call for urlencoded data
      
          var delivery_id_or_promise = $injector.get("$http").post(baseUrl+'api/v1/address_infos.json',processedData,{headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
             }).then(function(response) {
            formDataStorageService.setStepData("receiver_info_id", response.data.id);
            formDataStorageService.setStepData("del", obj.data.data.del_num);
            });
        }

        promise2 = $q.when(delivery_id_or_promise);
      }   
      //generate postable string of other step data
      else if(step == 2) {
        var data = {};
        $scope.data = formDataStorageService.getStepData(2);
        var shipper_appointment_time = '';
        var consignee_appointment_time = '';
        pickup_at_from = $filter('date')($scope.data.pickup_date,'yyyy-MM-dd')+' '+$filter('date')($scope.data.shipper_hours_from, "HH:mm:ss");
        pickup_at_to = $filter('date')($scope.data.pickup_date,'yyyy-MM-dd')+' '+$filter('date')($scope.data.shipper_hours_to, "HH:mm:ss");
        arrive_at_from = $filter('date')($scope.data.delivery_date, "yyyy-MM-dd")+' '+$filter('date')($scope.data.consignee_hour_from, "HH:mm:ss"); 
        arrive_at_to = $filter('date')($scope.data.delivery_date, "yyyy-MM-dd")+' '+$filter('date')($scope.data.consignee_hour_to, "HH:mm:ss"); 
        auction_end_at = $filter('date')($scope.data.auction_end_at, "yyyy-MM-dd HH:mm:ss"); 
        if($scope.data.appointment == "true"){
           shipper_appointment_time = $filter('date')($scope.data.pickup_date,'yyyy-MM-dd')+' '+$filter('date')($scope.data.mytime, "HH:mm:ss");
        }
        if($scope.data.consignee_category == "true"){
           consignee_appointment_time = $filter('date')($scope.data.delivery_date,'yyyy-MM-dd')+' '+$filter('date')($scope.data.consigneetime, "HH:mm:ss");
        }
        angular.extend(data,{pickup_at_from:pickup_at_from,
                              pickup_at_to:pickup_at_to,
                              arrive_at_from:arrive_at_from,
                              arrive_at_to:arrive_at_to,
                              auction_end_at:auction_end_at,
                              shipper_appointment_time:shipper_appointment_time,
                              consignee_appointment_time:consignee_appointment_time,
                              shipment_timing_notes:$scope.data.shipment_timing_notes
                            });
        formDataStorageService.setStepData("shipmentTimingData", data);
      }
      else if(step == 3) {

        angular.extend(obj.data.data,{distance:'12'
                        });

        formDataStorageService.setStepData("shipmentInfoData", obj.data.data);
      }
      else if(step == 4) {
        var data = formDataStorageService.getStepData('shipmentInfoData');
        var shipmentTimingData = formDataStorageService.getStepData('shipmentTimingData');
        var milestone = {};
        angular.extend(milestone,{eta_to_shipper:angular.isDefined(obj.data.data.eta_to_shipper) ? true : false,
                                  eta_to_consignee:angular.isDefined(obj.data.data.eta_to_consignee) ? true : false,
                                  appt_at_shipper:angular.isDefined(obj.data.data.appt_at_shipper) ? true : false,
                                  appt_at_consignee:angular.isDefined(obj.data.data.appt_at_consignee) ? true : false,
                                  arrived_at_shipper:angular.isDefined(obj.data.data.arrived_at_shipper) ? true : false,
                                  arrived_at_consignee:angular.isDefined(obj.data.data.arrived_at_consignee) ? true : false,
                                  loaded_at_shipper: true,
                                  unloaded_at_consignee:true
                    });
       var milstonedData = formDataStorageService.urlEncodedData(milestone,'shipment_milestone[',']=');// To make 'shipment_milestone' object
        formDataStorageService.setStepData("milstonedData", milstonedData);

        angular.extend(data,{require_daily_update:obj.data.data.require_daily_update,
                            shipment_tracking_notes:obj.data.data.shipment_tracking_notes,
                            daily_update_at_time: $filter('date')(obj.data.data.daily_update_at_time, "hh:mm a"),
                            pickup_at_from:shipmentTimingData.pickup_at_from,
                            pickup_at_to:shipmentTimingData.pickup_at_to,
                            arrive_at_from:shipmentTimingData.arrive_at_from,
                            arrive_at_to:shipmentTimingData.arrive_at_to,
                            auction_end_at:shipmentTimingData.auction_end_at,
                            shipment_timing_notes:shipmentTimingData.shipment_timing_notes
                    });
        formDataStorageService.setStepData("finalData", data);
      }
    });

      $q.all([promise1, promise2]).then(function(response){
        var delivery_id_or_promise = formDataStorageService.getStepData('receiver_info_id');
        var shipper_id_or_promise = formDataStorageService.getStepData('shipper_info_id');
        var del_number = formDataStorageService.getStepData('del');
        var pe_number = formDataStorageService.getStepData('pe');
        var prefix = 'shipment[';
        var suffix = ']=';  
        var data ={};
        var processedData ='';
        var milstonedData = '';
         data = formDataStorageService.getStepData('finalData');
        var stateValue = formDataStorageService.getStepData('state');

        angular.extend(data,{receiver_info_id:delivery_id_or_promise,
                            shipper_info_id:shipper_id_or_promise,
                            del:del_number,
                            pe:pe_number
                    });
       
        processedData = formDataStorageService.urlEncodedData(data,prefix,suffix);// Function call for urlencoded data
        milstonedData = formDataStorageService.getStepData('milstonedData');
        processedData = processedData+'&state='+stateValue;
       if(angular.isString(milstonedData))
       {
          processedData = processedData+'&'+milstonedData;
       }
        $injector.get("$http").post(baseUrl+'api/v1/shipments.json',processedData,{headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
             }).then(function(response) {
            // notificationService.setMessage('success', 'Shipment saved!');
            });  
             });  
        //console.log("let's submit the form now..");
    }
    /***************
    Function Name : saveAsDraft
    Description : This function is called to save data and state as draft.
    ****************/
     $scope.saveAsDraft = function() {
           $scope.formSubmitted = true;
           if(!this.stepForm.$valid)
             return;
          // console.log($scope.data);
          formDataStorageService.setStepData($scope.step, $scope.data);
          formDataStorageService.setStepData("state", 'draft');
          //console.log("Inside Draftf");
          this.saveData();
          notificationService.setMessage('success', 'Your information has been saved as Draft successfully!');
         $location.path('/myrfp');
     }
   /***************
    Function Name : saveCompleteData
    Description : This function is called to save data and state as proposing.
    ****************/
     $scope.saveCompleteData = function() {
       formDataStorageService.setStepData($scope.step, $scope.data);
          //console.log("Inside SUBMIT");
           $scope.formSubmitted = true;
           if(!this.stepForm.$valid)
              return;
          formDataStorageService.setStepData("state", 'proposing');
          this.saveData();
          notificationService.setMessage('success', 'Your information has been submitted successfully!');
          $location.path('/myrfp');
     }
    
    //initialize data 
    $scope.data = formDataStorageService.getStepData($scope.getStep());
    angular.extend($scope.data,{consignee_hour_from:consignee_hour_from,
                                consignee_hour_to:consignee_hour_to,                                
                                shipper_hours_from:shipper_hours_from,
                                shipper_hours_to:shipper_hours_to,
                                consigneetime:mytime,
                                mytime:mytime,
                                daily_update_at_time:mytime
                            });
  
}]);
/******************************
Controller Name :- ViewAllRfpCtrl
Description:- Used to populate all record of rfp

*******************************/

rfpApp.controller('ViewAllRfpCtrl', ['$scope', '$http','$window','$uibModal','$route', '$routeParams','formDataStorageService','notificationService',function ($scope,$http,$window,$uibModal,$route, $routeParams,formDataStorageService,notificationService) {
 
  $scope.items = {
    input: {limit: 5, status: ''},
    data: []
  };  
  
  //detail of the row/item
  $scope.detailItem = {};
  
  //currently open row
  $scope.selected = null;
  $scope.prevSelected = null;
  //page parameters to be initialized from request's response
  $scope.currentPage = null;
  $scope.perPage = 5;
  $scope.totalItems;
  //page parameters end
  var modalInstance;
    
  var retrieveData = function() {
  
    $http.get(baseUrl+'api/v1/shipments.json?limit='+$scope.items.input.limit+'&status='+$scope.items.input.status+'&page='+$scope.currentPage).success(function(data){
      $scope.totalItems = data.total;
      $scope.items.data = data.results;
    });
  }
  
  //retrieve details of selected row
  var retrieveDetails = function(index) {
    
    $http.get(baseUrl+'api/v1/shipments/'+ $scope.items.data[index].id +'.json').success(function(data){

      $scope.detailItem = data;
      $scope.bidData = data.proposals;
    });    
  }
  
  // Open modal for edit shipment detail

   $scope.open = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'rfp/edit.html',
        controller: 'RfpEditModalCtrl',
        size: 'lg'
      });
    }


  $scope.getDateObj = function(string) {
    
    return (new Date(string));
  }
  
  $scope.pageChanged = function() {
    $scope.selected = null;
    $scope.prevSelected = null;
    retrieveData();
  }
  
  $scope.setVisible = function(index) {
   if($scope.prevSelected == index)
    {
       $scope.selected = null;
       $scope.prevSelected = null;
    }else{
      retrieveDetails(index);
      $scope.selected = index;
      $scope.prevSelected = index;
    }
  }  
  
  $scope.isVisible = function(index) {
    return $scope.selected == index ? true : false;
  }

//This function will change the state of shipment

  /*$scope.pauseRequest = function(index) {
    
      var responseData = formDataStorageService.pause(index,'pause').success(function(response) {
             console.log(response);
          }).error(function(data, response) {
             console.log(data);
          });
  }  */
   // Open pause confirmation dialog box 

   $scope.pauseConfirmation = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/pause_rfp.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }
  // Open delete confirmation dialog box 

   $scope.deleteConfirmation = function(index) {
      var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/delete_rfp.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }

   $scope.acceptConfirmation = function(index,shipment_id) {
      var id = formDataStorageService.setRecordId(index);
      var id = formDataStorageService.setShipmentId(shipment_id);
      modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'rfp/confirmation/accept_bid.html',
        controller: 'SetStatusCtrl',
        size: 'sm'
      });
    }

  $scope.contactDetail = function(index) {
     var id = formDataStorageService.setRecordId(index);
      modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'shipments/contact_dialog.html',
        controller: 'ShipmentsmodalCtrl'
      });
  }
 
  //default page data load
  retrieveData();
}]);

/******************************
Controller Name :- SetStatusCtrl
Description:- Used to open and close Modal as well as set status
*******************************/


rfpApp.controller('SetStatusCtrl', ['$scope','$route','$rootScope','$uibModalInstance','$uibModalStack','$uibModal','$injector', '$http', '$routeParams','formDataStorageService','notificationService', function ($scope,$route,$rootScope,$uibModalInstance,$uibModalStack,$uibModal,$injector,$http, $routeParams,formDataStorageService,notificationService) {
 
 var modalInstance;

 //This function is called when sDiscard button is clicked. This will remove Model from UI

$scope.close = function() {
    $uibModalInstance.dismiss();
  }

     //change the state of shipment
  $scope.pauseRequest = function() {
     $uibModalInstance.dismiss();
    var index = formDataStorageService.getRecordId();
    var responseData = formDataStorageService.pause(index,'pause').success(function(response) {
             notificationService.setMessage('success', 'Shipment paused!');
          }).error(function(response) {
              notificationService.setMessage('error', 'Shipment could not paused!');
        });  
  }
  $scope.postRequest = function() {
     $uibModalInstance.dismiss();
    var index = formDataStorageService.getRecordId();
    var responseData = formDataStorageService.pause(index,'propose').success(function(response) {
             notificationService.setMessage('success', 'Shipment posted!');
          }).error(function(response) {
              notificationService.setMessage('error', 'Shipment could not posted!');
        });  
  }
   //Delete the shipment
   $scope.deleteShipment = function(index) {
    $uibModalInstance.dismiss();
    var index = formDataStorageService.getRecordId();
      $http.delete(baseUrl+'api/v1/shipments/'+index+'.json').success(function(data){
        notificationService.setMessage('success', 'Your shipment has been deleted!');
        $route.reload();
      }).error(function(response) {
        notificationService.setMessage('error', 'Shipment could not deleted!');
        });  
  }
//Accept bid on the shipment
  $scope.acceptBid = function(index) {
    this.close();
      var index = formDataStorageService.getRecordId();
      var shipment_id = formDataStorageService.getShipmentId();
      var responseData = formDataStorageService.acceptProposal(index,shipment_id,'propose').success(function(response) {
              notificationService.setMessage('success', 'Bid accepted!');
          }).error(function(response) {
              notificationService.setMessage('error', 'Bid could not accepted!');
        });  
  }    

}]);
