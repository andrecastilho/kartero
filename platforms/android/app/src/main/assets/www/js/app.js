

var ajax_url= krms_driver_config.ApiUrl ;
var dialog_title_default= krms_driver_config.DialogDefaultTitle;
var search_address;
var ajax_request;
var networkState;
var reload_home;
var translator;

var ajax_request2;
var ajax_request3;
var map;
var watchID;

jQuery.fn.exists = function(){return this.length>0;}

function dump(data)
{
	console.debug(data);
}

function setStorage(key,value)
{
	localStorage.setItem(key,value);
}

function getStorage(key)
{
	return localStorage.getItem(key);
}

function removeStorage(key)
{
	localStorage.removeItem(key);
}

function explode(sep,string)
{
	var res=string.split(sep);
	return res;
}

function urlencode(data)
{
	return encodeURIComponent(data);
}

function empty(data)
{
	if (typeof data === "undefined" || data==null || data=="" ) { 
		return true;
	}
	return false;
}

function isDebug()
{
	//on/off
	//return true;
	return false;
}

function hasConnection()
{	
	if (isDebug()){
		return true;
	}
	var networkState = navigator.online;   
	if ( networkState=="Connection.NONE" || networkState=="none"){	
		return false;
	}	
	return true;
}

$( document ).on( "keyup", ".numeric_only", function() {
  this.value = this.value.replace(/[^0-9\.]/g,'');
});	 

/*START DEVICE READY*/
document.addEventListener("deviceready", function() {
	
	
	
	if ( !empty(krms_driver_config.PushProjectID)) {
		
		var push = PushNotification.init({
	        "android": {
	            "senderID": krms_driver_config.PushProjectID
	        },	        
	        "ios": {"alert": "true", "badge": "true", "sound": "true", "clearBadge": "true" }, 
	        "windows": {} 
	    });
	    
	    push.on('registration', function(data) {     	     	
	    	setStorage("device_id", data.registrationId );
	    	setStorage("device_platform", device.platform );	    	     	        
	    });
	    navigator.splashscreen.hide();
	    push.on('notification', function(data) {	
	     	 //alert(JSON.stringify(data));
	     	 //switch (data.additionalData.additionalData.push_type)
	     	 if ( data.additionalData.foreground ){
	     	  	 //when the app is active
	     	  	 setBaloon();
	     	  	 playNotification();	     	  	 
	     	  	 switch ( data.additionalData.data.actions )
	     	  	 {
	     	  	 	case "ASSIGN_TASK":
	     	  	 	case "CANCEL_TASK":
	     	  	 	case "UPDATE_TASK":
	     	  	 	if( $('#home').is(':visible') ){
	     	  	 		getTodayTask('');
	     	  	 	} 
	     	  	 	toastMsg( data.message ); 	  	 	
	     	  	 	break;
	     	  	 	
	     	  	 	case "private":
	     	  	 	case "bulk":
	     	  	 	onsenAlert( data.message );
	     	  	 	break;
	     	  	 	
	     	  	 	default:
	     	  	 	toastMsg( data.message ); 	  	 	
	     	  	 	break;
	     	  	 	
	     	  	 }
	     	 } else {	     	 	 
	     	 	 //when the app is not active
	     	 	 setBaloon();	     	 	 
	     	  	 switch ( data.additionalData.data.actions )
	     	  	 {
	     	  	 	case "ASSIGN_TASK":
	     	  	 	case "CANCEL_TASK":
	     	  	 	case "UPDATE_TASK":
	     	  	 	if( $('#home').is(':visible') ){
	     	  	 		getTodayTask('');
	     	  	 	} 
	     	  	 	toastMsg( data.message );
	     	  	 	break;
	     	  	 		     	  	 	
	     	  	 	case "private":
	     	  	 	case "bulk":
	     	  	 	onsenAlert( data.message );
	     	  	 	break;
	     	  	 	
	     	  	 	default:
	     	  	 	toastMsg( data.message ); 	  	 	
	     	  	 	break;
	     	  	 }
	     	 }
	    }); 	
	    
	    push.finish(function () {
	       //alert('finish successfully called');
	    });
	        
	    push.on('error', function(e) {
	       //onsenAlert("push error");
	    });   
	}
	
 }, false);
/*END DEVICE READY*/

// set device
ons.platform.select('android');
//ons.platform.select('ios');

ons.ready(function() {
	
	/*ons.setDefaultDeviceBackButtonListener(function() {	   	   
	});*/	
		
}); /*end ready*/


function setBaloon()
{
	var push_count = getStorage("push_count");
	if(empty(push_count)){
		push_count=0;
	}
	push_count=parseInt(push_count)+1;
	dump('setbaloon=>'+push_count);
	if (!empty(push_count)){
		if (push_count>0){
			setStorage("push_count", push_count );	
		    $(".baloon-notification").html(push_count);
		    $(".baloon-notification").show();
		}
	}
}

document.addEventListener("offline", noNetConnection, false);

function noNetConnection()
{
	toastMsg( getTrans("Internet connection lost","net_connection_lost") );
}

document.addEventListener("online", hasNetConnection, false);

function hasNetConnection()
{	
	//toastMsg( getTrans("Connected","connected") );
	//callAjax("DeviceConnected",'');
}

document.addEventListener("backbutton", function (e) {	   
   if( $('#pageLogin').is(':visible') ){
   	
   	 if( $('.alert-dialog-container').is(':visible') ){
   	 	
   	 } else {
	   	ons.notification.confirm({
		  message: getTrans("Are you sure to close the app?","close_app") ,	  
		  title: dialog_title_default ,		  
		  buttonLabels: [ getTrans("Yes","yes") ,  getTrans("No","no") ],
		  animation: 'default', // or 'none'
		  primaryButtonIndex: 1,
		  cancelable: true,
		  callback: function(index) {	 
		  	   e.preventDefault();     	   
		  	   if (index==0){	  	   	 
					if (navigator.app) {
					   navigator.app.exitApp();
					} else if (navigator.device) {
					   navigator.device.exitApp();
					} else {
					   window.close();
					}
		  	   } else {
		  	   	   return false;
		  	   }
		  }
		});  
   	 }
   	
   } else if ( $('#home').is(':visible') ){
   	  
   	   if( $('.alert-dialog-container').is(':visible') ){
   	   } else {
		   ons.notification.confirm({
			  message: getTrans("Are you sure you want to logout?","logout_confirm") ,	  
			  title: dialog_title_default ,			  
			  buttonLabels: [ getTrans("Yes","yes") ,  getTrans("No","no") ],
			  animation: 'default', // or 'none'
			  primaryButtonIndex: 1,
			  cancelable: true,
			  callback: function(index) {	
			  	   e.preventDefault();   	   
			  	   if (index==0){	  	   			  	   	        	   	 
					   Logout();		  	   	
			  	   } else {
			  	       return false;	
			  	   }
			  }
			});
   	    }
	   
   } else if ( $('#taskDetails').is(':visible') ){   	  
   	   //sNavigator.popPage({cancelIfRunning: true}); 
   	   kNavigator.popPage().then(function() {
		    reloadHome();		    		   
	   });	   
   } else {   	  
   	   navigator.app.backHistory();
   }
}, false);	

function refreshCon(action , params)
{
	if(empty(params)){
		params='';
	}
	dump(action);
	if (hasConnection()){
		callAjax(action,params)
	}
}

document.addEventListener("show", function(event) {	
	dump( "page id show :" + event.target.id );	
	switch (event.target.id){		
		case "pageLogin":	
		if ( isAutoLogin()!=1){			
			checkGPS();
		}	
		break;				
		
		case "home":	
		    checkGPS();	
		break;	
	}	
}, false);

document.addEventListener("init", function(event) {
		 dump( "page id :" + event.target.id );

		 switch (event.target.id) {		 
			/* document.getElementById("onduty").addEventListener('change', function(e) {
	               console.log('click', e.target.isInteractive );
	         });*/
			
			case "Map":			  
			  dump('init map');			  
			break;
					    			
			case "Notification":
			  callAjax('GetNotifications','');
			  
			   var pullHook = document.getElementById('pull-hook-notification');
			   pullHook.onAction = function(done) {						 	  
		              AjaxNotification("GetNotifications",'',done);
	             }; 
				 pullHook.addEventListener('changestate', function(event) {
				 	  var message = '';
				 	   dump(event.state);
				 	   switch (event.state) {
					      case 'initial':
					        message = '<ons-icon size="35px" icon="ion-arrow-down-a"></ons-icon> Pull down to refresh';
					        break;
					      case 'preaction':
					        message = '<ons-icon size="35px" icon="ion-arrow-up-a"></ons-icon> Release';
					        break;
					      case 'action':
					        message = '<ons-icon size="35px" spin="true" icon="ion-load-d"></ons-icon> Loading...';
					        break;
				      }
				      pullHook.innerHTML = message;
				});
			  
			break;
			
			case "Signature":
			case "profile":			
			TransLatePage();
			break;
			
			case "pageGetSettings":		
							
			if (isDebug()){
				if ( hasConnection()){
				    callAjax("GetAppSettings",'');
				} else {				
				   toastMsg( getTrans("Not connected to internet","no_connection") );
				   $(".loading_settings").html( getTrans("Not connected to internet","no_connection") );
				   $(".refresh_net").show();
				}	  
			} else {
				document.addEventListener("deviceready", function() {	            
		           if ( hasConnection()){
				       callAjax("GetAppSettings",'');
					} else {				
					   toastMsg( getTrans("Not connected to internet","no_connection") );
					   $(".loading_settings").html( getTrans("Not connected to internet","no_connection") );
					   $(".refresh_net").show();
					}	             
	            }, false);
			}
            
			break;
			
			case "page-login":
			case "pageLogin":
			if ( isAutoLogin()==1){
				$("#frm-login").hide();
			    $(".login-header").hide();
			    $(".auto-login-wrap").show();
			} 
			TransLatePage();				
			break;
			
			case "pageforgotpass":			
			TransLatePage();
			break;
			
			case "SettingPage":			
			callAjax("GetSettings",'');
			TransLatePage();
			break;
			
			case "profilePage":			
			  TransLatePage();
			  callAjax("GetProfile",'');			  			  
			break;			
			
			case "taskDetails":
			case "viewTaskDescription":
			$(".toolbar-title").html( getTrans("Getting info...",'getting_info')  );
			break;
			
			case "CalendarView":
			TransLatePage();
			$('#calendar').fullCalendar({
				height: 500,
				header: {
					left: 'prev',
					center: 'title',
					right: 'next'
				},
				eventClick: function(calEvent, jsEvent, view) {
					 //alert('Event: ' + calEvent.id);					 
				},
				dayClick: function(date, jsEvent, view) {						 
					 kNavigator.popPage().then(function() {
					 	 setStorage('kr_todays_date_raw', date.format() );
					 	 $(".todays_date").html( date.format('MMMM, DD') );					 	 
					     getTodayTask('');
				     });					
				},
				events: function (start, end, timezone, callback) {
					_start  = start.format('YYYY-MM-DD');
					_end  = end.format('YYYY-MM-DD');
					params="&start="+_start;
					params+="&end="+_end;
					
					if ( !hasConnection() ){
		               toastMsg( getTrans("Not connected to internet",'no_connection') );	
		               return;
	                }
					
					dump(ajax_url+"/CalendarTask/?token=" + getStorage("kr_token") + params);
					
				    $.ajax({
				     	 type: "post",
				     	  url: ajax_url+"/CalendarTask/?token=" + getStorage("kr_token") + params,
				     	  dataType: 'jsonp',
				     	  timeout: 6000,
				     	  crossDomain: true,
		                  beforeSend: function() {
		                  	loader.show();
		                  },
				     	  success: function (data) {	
				     	     hideAllModal();	
				     	     if ( data.details.length>0){				     	  	  
					     	  	  var events = [];				     	  	  
					     	  	  $.each(data.details, function (i, task_day) {				     	  	  	   
					     	  	  	   events.push({
						                    /*start: moment({
						                        year: task_day.year,
						                        month: task_day.month,
						                        day: task_day.day
						                    }),*/
						                    start : task_day.id,
						                    title: task_day.title,
						                    allDay: true,
						                    id:task_day.id,
						                    className:"total_task"
						                });
					     	  	  });
					     	  	  callback(events);
				     	  	  }
				     	  },
				     	  error: function (request,error) {	  
				     	  	  hideAllModal();		 
				     	  	  dump('errr');  
				     	  }
				    });
				}
			});
			break;
						
			
			case "home":
			 var pullHook = document.getElementById('pull-hook');
			 pullHook.onAction = function(done) {
			 	  params="date="+ getStorage("kr_todays_date_raw");
			 	  var onduty = document.getElementById('onduty').checked==true?1:2 ;	
			 	  params+="&onduty="+onduty;
			 	  dump(params);
	              AjaxTask("GetTaskByDate",params,done);
             };
			 pullHook.addEventListener('changestate', function(event) {
			 	  var message = '';
			 	   dump(event.state);
			 	   switch (event.state) {
				      case 'initial':
				        message = '<ons-icon size="35px" icon="ion-arrow-down-a"></ons-icon> Pull down to refresh';
				        break;
				      case 'preaction':
				        message = '<ons-icon size="35px" icon="ion-arrow-up-a"></ons-icon> Release';
				        break;
				      case 'action':
				        message = '<ons-icon size="35px" spin="true" icon="ion-load-d"></ons-icon> Loading...';
				        break;
			      }
			      pullHook.innerHTML = message;
			 });
			 
			 break;					 			 
			 	 
	 } /*end switch*/
	 		 
}, false);


function autoLogin()
{
	dump('autoLogin');
	var kr_remember = getStorage("kr_remember");	
	if ( kr_remember=="on"){
		var kr_username=getStorage("kr_username");
		var kr_password=getStorage("kr_password");
		var kr_remember=getStorage("kr_remember");
		if (!empty(kr_username) && !empty(kr_password)){
			dump('auto login');
			$("#frm-login").hide();
			$(".login-header").hide();
			$(".auto-login-wrap").show();
			var params="username="+kr_username+"&password="+kr_password+"&remember="+kr_remember;
			
			params+="&device_id="+ getStorage("device_id");
	        params+="&device_platform="+ getStorage("device_platform");
			
			dump(params);
			callAjax("login",params);
		}
	}
}

function exitKApp()
{
	ons.notification.confirm({
	  message: getTrans("Are you sure to close the app?","close_app") ,	  
	  title: dialog_title_default ,
	  buttonLabels: [ "Yes" ,  "No" ],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {	  	   
	  	   if (index==0){	  	   	      	   	  
				if (navigator.app) {
				   navigator.app.exitApp();
				} else if (navigator.device) {
				   navigator.device.exitApp();
				} else {
				   window.close();
				}
	  	   }
	  }
	});
}

function showPage(page_id, action )
{	
	if (action==1){
	   popover.hide();
	}
	var options = {
	  animation: 'slide',
	  onTransitionEnd: function(){		  
	  } 
	};  
	kNavigator.pushPage(page_id, options);		
}

/*mycall*/
function callAjax(action,params)
{
	dump("action=>"+action);	
	
	if ( !hasConnection() ){
		toastMsg( getTrans("Not connected to internet",'no_connection') );	
		return;
	}
	
	params+="&lang_id="+getStorage("kr_lang_id");
	if(!empty(krms_driver_config.APIHasKey)){
		params+="&api_key="+krms_driver_config.APIHasKey;
	}		
	if ( !empty( getStorage("kr_token") )){		
		params+="&token="+  getStorage("kr_token");
	}
	
	dump(ajax_url+"/"+action+"?"+params);
	
	ajax_request = $.ajax({
		url: ajax_url+"/"+action, 
		data: params,
		type: 'post',                  
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
		 beforeSend: function() {
			if(ajax_request != null) {			 	
			   /*abort ajax*/
			   hideAllModal();	
	           ajax_request.abort();
			} else {    
				/*show modal*/			   
				loader.show();			    
			}
		},
		complete: function(data) {					
			//ajax_request=null;   	
			ajax_request= (function () { return; })();     				
			hideAllModal();		
		},
		success: function (data) {	
			
			dump(data);
		   	if (data.code==1){
		   		
		   		switch(action)
		   		{
		   			case "login":		
		   			dump('LOGIN OK');  
		   			setStorage("kr_username", data.details.username);
		   			setStorage("kr_password", data.details.password);
		   			setStorage("kr_remember", data.details.remember);
		   			setStorage("kr_todays_date", data.details.todays_date);
		   			setStorage("kr_todays_date_raw", data.details.todays_date_raw);
		   			setStorage("kr_token", data.details.token);
		   			
		   			setStorage("kr_location_accuracy", data.details.location_accuracy);
		   			
					kNavigator.pushPage("home.html", {
					  animation: 'slide',
					  callback: function(){		 					  	  
					  	  $(".todays_date").html( getStorage("kr_todays_date") );
					  	  if ( data.details.on_duty==1){
					  	  	 onduty.checked=true;
					  	  	 $(".duty_status").html( getTrans("On-Duty",'on_duty') );
					  	  } else {
					  	  	 onduty.checked=false;
					  	  	 $(".duty_status").html( getTrans("Off-duty",'off_duty')  );
					  	  }				  	  
					  	  					  	  
					  	  getTodayTask( data.details.todays_date_raw );
					  	  
					  } 
					});
		   			break;
		   			
		   			case "ChangeDutyStatus":
		   			  if ( data.details==1){
		   			     $(".duty_status").html( getTrans("On-Duty",'on_duty') );
		   			  } else {
		   			  	 $(".duty_status").html( getTrans("Off-duty",'off_duty')  );
		   			  }
		   			break;
		   			
		   			case "getTaskByDate":
		   			$(".no-task-wrap").hide();
		   			$("#task-wrapper").show();
		   			dump( 'fill task' );
		   			//console.log(data);
		   			$("#task-wrapper").html( formatTask(data.details) );   			
		   			break;
		   			
		   			case "TaskDetails":
		   			$(".toolbar-title").html ( data.msg ) ;
		   			$("#task-details").html( 
		   			   formatTaskDetails(data.details) + 
		   			   TaskDetailsChevron_1(data.details)  + 
		   			   TaskDetailsChevron_2(data.details) +
		   			   //OrderDetails(data.details) +
		   			   TaskAddSignature( data.details ) +
		   			   TaskDetailsChevron_3(data.details.history)
		   			);
		   			
		   			//show signature
		   			
		   			$("#task-action-wrap").html( 
		   			  swicthButtonAction( data.details.task_id, data.details.status_raw )
		   			);
		   					   					   			
		   			break;
		   			
		   			case "viewTaskDescription":
		   			$(".toolbar-title").html ( data.msg ) ;
		   			$("#task-description").html( taskDescription(data.details) );
		   			break;
		   			
		   			
		   			case "changeTaskStatus":
		   			
		   			  reload_home=1;
		   			  if ( data.details.reload_functions =="TaskDetails"){
		   			  	   callAjax("TaskDetails",'task_id=' + data.details.task_id );
		   			  }
		   			  if ( data.details.reload_functions=="getTodayTask"){
		   			  	   kNavigator.popPage().then(function() {
							    getTodayTask('');
						   })
		   			  }
		   			  
		   			  $("#task-action-wrap").html( 
		   			     swicthButtonAction( data.details.task_id, data.details.status_raw )
		   			  );
		   			  
		   			break;
		   			
		   			case "AddSignatureToTask":
		   			    kNavigator.popPage().then(function() {							
		   			    	callAjax("TaskDetails",'task_id=' + data.details );
				        });
		   			break;
		   			
		   			
		   			case "GetProfile":
		   			$(".driver-fullname").html( data.details.full_name );
		   			$(".team-name").html( data.details.team_name );
		   			$(".driver-email").html( data.details.email );
		   			$(".phone").val( data.details.phone );
		   			
		   			$(".transport_type_id2").html( data.details.transport_type_id2 );
		   			$(".transport_description").val( data.details.transport_description );
		   			$(".licence_plate").val( data.details.licence_plate );
		   			$(".color").val( data.details.color );
		   			
		   			$(".transport_type_id").val( data.details.transport_type_id );
		   			switchTransportFields( data.details.transport_type_id );
		   			
		   			break;
		   			
		   			
		   			case "GetTransport":
		   			  var html='';
		   			  x=1;	   			 
		   			  $.each( data.details, function( key, val ) { 		   			  	  
		   			  	  html+=OptionListTransport('transport_type', key, val , x);
		   			  	  x++;
		   			  });
		   			  $("#transport-list").html(  html );
		   			break;
		   			
		   			case "ProfileChangePassword":
		   			  setStorage("kr_password", data.details);
		   			  onsenAlert( data.msg );   
		   			break;
		   			
		   			//silent
		   			case "SettingPush":
		   			case "DeviceConnected":		   			
		   			break;
		   			
		   			case "GetSettings":
		   			  
		   			  device_id=getStorage('device_id');
		   			  if (!empty(device_id)){
		   			  	 $('.device_id').html( device_id );
		   			  }
		   			
		   			  if ( data.details.enabled_push==1){
		   			      enabled_push.checked=true;
		   			  } else {
		   			  	  enabled_push.checked=false;
		   			  }
		   			  
		   			  kr_lang_id=getStorage("kr_lang_id");
		   			  if(!empty(kr_lang_id)){
		   			  	  $(".language_selected").html( data.details.language[kr_lang_id] );
		   			  }
		   			  
		   			break;
		   			
		   			case "LanguageList":
		   			 $("#language-list").html('');
		   			 var html='';
		   			  x=1;	   			 
		   			  $.each( data.details, function( key, val ) { 		   			  	  
		   			  	  html+=OptionListLanguage(val, val, val , x);
		   			  	  x++;
		   			  });
		   			  $("#language-list").html(  html );
		   			break;
		   			
		   			case "GetAppSettings":
		   			   dump('GetAppSettings');		 		   			   
		   			   
		   			   setStorage("kr_translation",JSON.stringify(data.details.translation));
		   			   
		   			   //set sounds url
		   			   setStorage("notification_sound_url",data.details.notification_sound_url);
		   			   
		   			   // set the language id
		   			   if ( empty( getStorage("kr_lang_id") )){
		   			   	  setStorage("kr_lang_id","en");  
		   			   } 
		   			   
		   			   var auto_login = isAutoLogin();
	                   
	                   if ( auto_login == 1) {	       
	                   	   dump('execute auto login');   	                   	   
	                   	   kNavigator.pushPage("pagelogin.html", {
							  animation: 'fade',
							   callback: function(){		
							   	  var kr_username=getStorage("kr_username");
		                          var kr_password=getStorage("kr_password");
		                          var kr_remember=getStorage("kr_remember");							  	  
							  	  var params="username="+kr_username+"&password="+kr_password;
							  	  params+="&remember="+kr_remember;
							  	  
							  	  params+="&device_id="+ getStorage("device_id");
	                              params+="&device_platform="+ getStorage("device_platform");
							  	  
							  	  dump(params);
			                      callAjax("login",params);
							  } 
						   });
	                   } else {
	                   	   kNavigator.pushPage("pagelogin.html", {
							  animation: 'fade',
							  callback: function(){						  	  
							  } 
						   });
	                   }
	                   
		   			break;
		   			
		   			case "ViewOrderDetails":
		   			$("#order-details").html( formatOrderDetails( data.details , data.msg ) );
		   			break;
		   			
		   			case "GetNotifications":		   			
		   			$("#notifications-details").html( formatNotifications( data.details ) );
		   			clearPushCount();
		   			TransLatePage();		   			
		   			break;
		   			
		   			
		   			case "clearNofications":
		   			$("#notifications-details").html('');	
		   			clearPushCount();
		   			break;
		   			
		   			case "Logout":
		   			removeStorage('kr_token');
		   			break;
		   			
		   			default:
		   			onsenAlert( data.msg );
		   			break;
		   		}
		   		
		   	} else { // failed 
		   		
		   		switch (action)
		   		{
		   			
		   			case "getTaskByDate":		   			  
		   			  $(".no-task-wrap").show();
		   			  $(".no-task-wrap p").html( data.msg );
		   			  $("#task-wrapper").html('');
		   			  //$("#task-wrapper").hide();
		   			  toastMsg( data.msg );
		   			break;

		   			case "login":
		   			checkGPS();		   			   		
		   			$("#frm-login").show();
			        $(".login-header").show();
			        $(".auto-login-wrap").hide();
		   			onsenAlert( data.msg );
		   			removeStorage("kr_remember");
		   			break;
		   			
		   			//silent		   			
		   			case "SettingPush":
		   			case "GetAppSettings":
		   			case "DeviceConnected":
		   			case "Logout":
		   			break;
		   					   			
		   			case "GetNotifications":
		   			clearPushCount();
		   			toastMsg( data.msg );
		   			TransLatePage();
		   			break;
		   			
		   			case "changeTaskStatus":		   			
		   			  reload_home=1;
		   			  toastMsg( data.msg );
		   			  kNavigator.popPage().then(function() {
		                 reloadHome();		    		   
	                  });	   
		   			break;
		   				
		   			default:		   			
		   			onsenAlert( data.msg );
		   			break;
		   		}
		   	}
		},
		error: function (request,error) {	        
		    hideAllModal();					
			switch (action)
			{
				case "GetAppSettings":
				case "getLanguageSettings":
				case "registerMobile":
				break;
												
				default:
				toastMsg( getTrans("Network error has occurred please try again!",'network_error') );		
				break;
			}
		}
	});
}

function AjaxTask(action, params , done)
{
	dump('AjaxTask');
	if ( !hasConnection() ){
		toastMsg( getTrans("Not connected to internet","no_connection") );
		done();
		return;
	}

	params+="&lang_id="+getStorage("kr_lang_id");
	if(!empty(krms_driver_config.APIHasKey)){
		params+="&api_key="+krms_driver_config.APIHasKey;
	}		
	if ( !empty( getStorage("kr_token") )){		
		params+="&token="+  getStorage("kr_token");
	}
	
	dump(ajax_url+"/"+action+"?"+params);
	
	ajax_request = $.ajax({
		url: ajax_url+"/"+action, 
		data: params,
		type: 'post',                  
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
		 beforeSend: function() {
			if(ajax_request != null) {			 				   
	           ajax_request.abort();
			} else {    
			}
		},
		complete: function(data) {					
			ajax_request=null;   	     							
		},
		success: function (data) {	
			dump(data);
			done();
			if ( data.code==1){
				
				$(".no-task-wrap").hide();
		   	    $("#task-wrapper").show();
		   		dump( 'fill task' );
		   	    $("#task-wrapper").html( formatTask( data.details ) );		   			
				
			} else {				
	   			$(".no-task-wrap").show();
	   		    $(".no-task-wrap p").html( data.msg );	  
	   		    $("#task-wrapper").html(''); 
	   		    toastMsg( data.msg );			
			}
		},
		error: function (request,error) {	  		    
			done();
		}
	});
	
}

function getTrans(words,words_key)
{
	
}

function onsenAlert(message,dialog_title)
{
	if (typeof dialog_title === "undefined" || dialog_title==null || dialog_title=="" ) { 
		dialog_title=dialog_title_default;
	}
	ons.notification.alert({
      message: message,
      title:dialog_title
    });
}

function toastMsg( message )
{	
	
	if (isDebug()){
		onsenAlert( message );
		return ;
	}
	 /*
    window.plugins.toast.showWithOptions(
      {
        message: message ,
        duration: "long",
        position: "bottom",
        addPixelsY: -40 
      },
      function(args) {
      	
      },
      function(error) {
      	onsenAlert( message );
      }
    );
    */
}

function hideAllModal()
{	
	setTimeout('loader.hide()', 1);
}

function login() {	
	var params = $( ".frm").serialize();
	params+="&device_id="+ getStorage("device_id");
	params+="&device_platform="+ getStorage("device_platform");
	dump(params);	
	callAjax("login",params);
}

function forgotPass()
{
	dump('forgotPass');
	var params = $( "#frm-forgotpass").serialize();
	dump(params);
	callAjax("ForgotPassword",params);
}

var xx=0;
var lastUpdateTime,
minFrequency = 10*2000;

function getCurrentPosition()
{	 
	 watchID = navigator.geolocation.watchPosition( function(position) {
	 //navigator.geolocation.getCurrentPosition( function(position) {	 
	 
	     var now = new Date();
	     
	     dump( position.coords.latitude);	 
	     dump(  position.coords.longitude );	   
	     
	     var now = new Date();
	     
	     if(!empty(lastUpdateTime)){	     	 
	     	 var freq_time = now.getTime() - lastUpdateTime.getTime();	 
	     	 if ( freq_time <  minFrequency ) {
	     	 	 dump("Ignoring position update");
	     	 	 return ;
	     	 }
	     }
	     lastUpdateTime = now;	 	     	     
	     //$(".watch-id").html( xx++ );	     
	     
	     params = 'lat='+ position.coords.latitude + "&lng=" + position.coords.longitude;
	     callAjax2('updateDriverLocation', params);
	     
	 },function(error) {
	 	 dump('error position');
	 	 navigator.geolocation.clearWatch(watchID);
	 },
	   { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
	 );	 	 
}

var showChangePassword = function() {
  var dialog = document.getElementById('dialogChangePass');
  if (dialog) {
      dialog.show();
  } else {
    ons.createDialog('changePassword.html')
      .then(function(dialog) {
        dialog.show();       
        setTimeout('TransLatePage()', 300);	
    });
  }
};

function changePassword()
{
	var params = $( "#frm-changepass").serialize();
	callAjax("ChangePassword",params);
}

var onduty_handle=0;

function changeDuty()
{		
	onduty_handle++;
	dump(onduty_handle);
	var onduty = document.getElementById('onduty').checked==true?1:2 ;	
	params="onduty="+onduty;
	//if ( onduty_handle==2){
	   callAjax("ChangeDutyStatus",params);
	   onduty_handle=0;
	//}
	if ( onduty==2){		
		navigator.geolocation.clearWatch(watchID);
	} else {
		checkGPS();
	}
}

var showMenu = function(element) {   
   popover.show(element);
};

function getTodayTask(raw_date)
{
   if (empty(raw_date)){
   	   raw_date=getStorage('kr_todays_date_raw');
   }
   callAjax("getTaskByDate","date="+raw_date);
}

function showTask(task_id)
{
   dump(task_id);	
   reload_home=2;
   /*kNavigator.pushPage("taskDetails.html", {
      animation: 'slide',
   }).then(function(page) {   
   	    callAjax("TaskDetails",'task_id=' + task_id);
   });      */    
   kNavigator.pushPage("taskDetails.html", {
	  animation: 'slide',
	  callback: function(){		 					  	  
	  	callAjax("TaskDetails",'task_id=' + task_id);
	  } 
   });
}

function viewTaskDescription(task_id)
{	
	kNavigator.pushPage("viewTaskDescription.html", {
	  animation: 'none',
	  callback: function(){		 					  	  
	  	callAjax("viewTaskDescription",'task_id=' + task_id);
	  } 
   });
}

function swicthButtonAction( task_id, status_raw )
{
	dump(status_raw);
	var html=''; var action='';
	dump("swicthButtonAction " + status_raw);
	switch (status_raw)
	{
		case "assigned":
		case "unassigned":
		action='acknowledged';
		html+='<p><ons-button modifier="large yellow-button"';
		html+='onclick="changeTaskStatus('+task_id+','+ "'"+action+"'" +' )" > '+ getTrans("Accept",'accept') +' </ons-button></p>';
		
		action='declined';
		html+='<p><ons-button modifier="quiet"';
		html+='onclick="declinedTask('+task_id+','+ "'"+action+"'" +' )" >'+ getTrans("Decline",'decline') +'</ons-button></p>';
		break;
		
		case "acknowledged":
		action='started';
		html+='<p><ons-button modifier="large yellow-button"';
		html+='onclick="changeTaskStatus('+task_id+','+ "'"+action+"'" +' )" >'+ getTrans('Start','start') +'</ons-button></p>';
		
		action='cancelled';
		html+='<p><ons-button modifier="quiet"';
		html+='onclick="ShowAddReason('+task_id+','+ "'"+action+"'" +' )" >'+ getTrans('Cancel','cancel') +'</ons-button></p>';
		break;
		
		case "started":
		action='inprogress';
		html+='<p><ons-button modifier="large yellow-button"';
		html+='onclick="changeTaskStatus('+task_id+','+ "'"+action+"'" +' )" >'+getTrans('Arrived','arrived')+'</ons-button></p>';
		
		action='cancelled';
		html+='<p><ons-button modifier="quiet"';
		html+='onclick="ShowAddReason('+task_id+','+ "'"+action+"'" +' )" >'+getTrans('Cancel','cancel')+'</ons-button></p>';
		break;
		
		case "inprogress":
		action='successful';
		html+='<p><ons-button modifier="large yellow-button"';
		html+='onclick="changeTaskStatus('+task_id+','+ "'"+action+"'" +' )" >'+getTrans('Successful','successful')+'</ons-button></p>';
		
		action='failed';
		html+='<p><ons-button modifier="quiet"';
		html+='onclick="ShowAddReason('+task_id+','+ "'"+action+"'" +' )" >'+getTrans('Failed','failed')+'</ons-button></p>';
		break;
		
		case "successful":
		break;
		
		case "failed":
		break;
		
		case "declined":
		break;
		
		case "cancelled":
		break;
		
		default:
		break;
	}
	return html ;	
}

function changeTaskStatus(task_id, status_raw )
{
	dump(task_id );
	dump(status_raw);		
	callAjax("changeTaskStatus",'task_id=' + task_id +"&status_raw="+status_raw ) ;
}

function reloadHome()
{
	dump('reloadHome');
	dump(reload_home);
	if ( reload_home==1){
	   getTodayTask('');
	}
}

function ShowAddReason(task_id , status_raw)
{
	dump(task_id);
	dump(status_raw);
	
	var dialog = document.getElementById('reasonTask');
	if (dialog) {
	      dialog.show();	      
	      $("#reason_task_id").val( task_id );
	      $("#reason_status_raw").val( status_raw );
	} else {
	    ons.createDialog('reasonTask.html')
	      .then(function(dialog) {
	        dialog.show();	        
	        $("#reason_task_id").val( task_id );
	        $("#reason_status_raw").val( status_raw );
	        setTimeout('TransLatePage()', 300);	
	    });
	}	
}

function declinedTask( task_id , status_raw )
{
	dump(task_id);
	dump(status_raw);
	ons.notification.confirm({
		title:dialog_title_default,
		message:"Are you sure?",
		buttonLabels: ['No', 'Yes'],
	})
	.then(
      function(answer) {
        if (answer === 1) {
           dump('ok');
           callAjax("changeTaskStatus",'task_id=' + task_id +"&status_raw="+status_raw ) ;
        }
      }
    );
}

function AddReasonTask()
{	
	if ( $("#reason").val()==""){
		onsenAlert("Reason is required");
		return;
	}
	var task_id=$("#reason_task_id").val();
	var status_raw=$("#reason_status_raw").val();
	reasonTask.hide();
	callAjax("changeTaskStatus",'task_id=' + task_id +"&status_raw="+status_raw + "&reason="+ $("#reason").val() ) ;
}

function ShowSignaturePage( task_id , signature , status )
{	
	kNavigator.pushPage("Signature.html", {
	  animation: 'none',
	  callback: function(){		 		
	  	 $(".task_id_signature").val(  task_id );	  	 
	  	 if ( status=="successful"){
	  	 	$(".toolbar-title-signature").html( getTrans("View Signature",'view_signature') );
	  	 	$(".signature-action").hide();
	  	 	if ( !empty(signature)){	  	 	
	  	 		
	  	 	   signature_html='<div class="img_loaded" >';
	  	 	   signature_html += '<img src="'+signature+'" />';
	  	 	   signature_html+='</div>';
	  	 	   
	  	 	   $("#signature-pan").html ( signature_html )  ;
	  	 	   
	  	 	   imageLoaded('.img_loaded');	  	 	
	  	 	}
	  	 } else {	  	 	  	 	
	  	 	$(".toolbar-title-signature").html( getTrans("Add Signature",'add_signature') );
	  	 	$(".signature-action").show();
	  	 	$("#signature-pan").jSignature();	  	
	  	 }	  	 	  	 
	  } 
   });
}

function resetSignature()
{
	dump('resetSignature');
	$("#signature-pan").jSignature("reset");	  	
}

function AddSignatureToTask()
{
	//var datapair = $("#signature-pan").jSignature("getData", "svgbase64");
	var datapair = $("#signature-pan").jSignature("getData","base30");	
	callAjax("AddSignatureToTask","image="+datapair +"&task_id=" + $(".task_id_signature").val() );
}

function imageLoaded(div_id)
{	
	$(div_id).imagesLoaded()
	  .always( function( instance ) {
	    console.log('all images loaded');
	  })
	  .done( function( instance ) {
	    console.log('all images successfully loaded');
	  })
	  .fail( function() {
	    console.log('all images loaded, at least one is broken');
	  })
	  .progress( function( instance, image ) {
	    var result = image.isLoaded ? 'loaded' : 'broken';	    	   
	    image.img.parentNode.className = image.isLoaded ? '' : 'is-broken';
	    console.log( 'image is ' + result + ' for ' + image.img.src );	    
	});
}

function showCalendarView()
{
	kNavigator.pushPage("CalendarView.html", {
	  animation: 'slide',
	  callback: function(){		 					  	  
	  	  dump('CalendarView');		  
	  } 
   });
}

function showTransportType()
{
   var dialog = document.getElementById('transporType');
   if (dialog) {
      dialog.show();
   } else {
      ons.createDialog('transporType.html')
      .then(function(dialog) {
      	callAjax("GetTransport",'');
        dialog.show();
      });
   }   
}

function setTransportType(key , val)
{	
	transporType.hide();
	$(".transport_type_id2").html( val );
	$(".transport_type_id").val( key );
	switchTransportFields( key );
}

function switchTransportFields( transport_type )
{
	if ( transport_type=="walk" ){
		$(".with-car").hide();
	} else {
		$(".with-car").show();
	}
}

function UpdateForms(form_id , action )
{
	var params = $( "#"+form_id).serialize();	
	callAjax(action,params);
}

var switch_handle=0;

function UpdatePush()
{
	switch_handle++;
	dump('UpdatePush');
	var enabled_push = document.getElementById('enabled_push').checked==true?1:2 ;	
	params="enabled_push="+enabled_push;
	//if ( switch_handle==2){
	   callAjax("SettingPush",params);
	   switch_handle=0;
	//}
}


function ShowLanguageOption()
{
   var dialog = document.getElementById('LanguageList');
   if (dialog) {
   	  callAjax("LanguageList",'');
      dialog.show();
   } else {
      ons.createDialog('LanguageList.html')
      .then(function(dialog) {
      	callAjax("LanguageList",'');
        dialog.show();
      });
   }   
}

function SetLanguage(lang_id , language)
{
	dump(lang_id);
	dump(language);
	$(".language_selected").html( language );
	setStorage("kr_lang_id",lang_id);
	LanguageList.hide();
	TransLatePage();
}

function Logout()
{	
	removeStorage('kr_username');
	removeStorage('kr_password');
	removeStorage('kr_remember');	
	
	popover.hide();
	$(".auto-login-wrap").hide();
	$("#frm-login").show();
	$(".login-header").show();
    kNavigator.popPage().then(function() {	
    	// clear watch id
    	navigator.geolocation.clearWatch(watchID);
    	callAjax("Logout",'');			    	   
    });
}

function TransLatePage()
{
	var dictionary;
	dump('TransLating page');
	if (typeof getStorage("kr_translation") === "undefined" || getStorage("kr_translation")==null || getStorage("kr_translation")=="" ) { 	   
		return;		
	} else {
		dictionary =  JSON.parse( getStorage("kr_translation") );
	}	
	if (!empty(dictionary)){
		//dump(dictionary);
		var kr_lang_id=getStorage("kr_lang_id");		
		if (!empty(kr_lang_id)){
			//dump(kr_lang_id);
			translator = $('body').translate({lang: kr_lang_id, t: dictionary});
			translateForms();
			translateTabs();
		}
	}
}

function translateForms()
{
	var t='';
	$.each( $(".field-wrap") , function() { 				
		var temp_value=$(this).find("input.text-input").attr("placeholder");		
		if(!empty(temp_value)){
			key = $(this).find("ons-input").data("trn-key");			
		    t = getTrans(temp_value, key );		    
		    $(this).find("input.text-input").attr("placeholder",t);
		    $(this).find("._helper").html(t);		    
		}
	});	
}

function translateTabs()
{
	var t='';
	$.each( $(".tab-bar__item") , function() { 				
		var temp_value=$(this).find(".tab-bar__label").html();		
		if(!empty(temp_value)){		
			key = $(this).data("trn-key");							
			t = getTrans(temp_value, key );		    
		    $(this).find(".tab-bar__label").html(t);    
		}
	});	
}

function getTrans(words,words_key)
{
	var temp_dictionary='';		
	
	if (typeof getStorage("kr_translation") === "undefined" || getStorage("kr_translation")==null || getStorage("kr_translation")=="" ) { 	   
		return words;
	} else {
		temp_dictionary =  JSON.parse( getStorage("kr_translation") );
	}	
	
	if (!empty(temp_dictionary)){
		//dump(temp_dictionary);		
		var default_lang=getStorage("kr_lang_id");
		//dump(default_lang);
		if (default_lang!="undefined" && default_lang!=""){
			//dump("OK");
			if ( array_key_exists(words_key,temp_dictionary) ){
				//dump('found=>' + words_key +"=>"+ temp_dictionary[words_key][default_lang]);				
				return temp_dictionary[words_key][default_lang];
			}
		}
	}	
	return words;
}

function array_key_exists(key, search) {  
  if (!search || (search.constructor !== Array && search.constructor !== Object)) {
    return false;
  }
  return key in search;
}

function isAutoLogin()
{
   var auto_login=2;
   var kr_remember = getStorage("kr_remember");	
   if ( kr_remember=="on"){
   	   var kr_username=getStorage("kr_username");
       var kr_password=getStorage("kr_password");
       var kr_remember=getStorage("kr_remember");
       if (!empty(kr_username) && !empty(kr_password)){
       	    auto_login=1;
       }
   } 
   return auto_login;
}

function ShowOrderDetails( order_id )
{
	kNavigator.pushPage("OrderDetails.html", {
	 animation: 'slide',
	  callback: function(){		 					  	  
	  	 callAjax("ViewOrderDetails",'order_id=' + order_id );
	  } 
   });
}

var watch_count=1;

var onSuccess = function(position) {
	var html='';
	html='Lat : '+position.coords.latitude;
	html+='<br/>';
	html+= watch_count++;
	html+='<br/>';
	html+='Lat : '+position.coords.longitude;
	$(".location-res").html( html );
};

function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function checkGPS()
{				
	 if (isDebug()){
		return ;
	 }
	 
	 /*
	 if ( device.platform =="android"){	 	 	 	 
	 	 getCurrentPosition();
	 	 return;
	 }
	 */
	 
     //cordova.plugins.locationAccuracy.request( onRequestSuccess, 
	 //onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
}

function onRequestSuccess(success){
    //alert("Successfully requested accuracy: "+success.message);
    getCurrentPosition();
}

function onRequestFailure(error){
    //alert("Accuracy request failed: error code="+error.code+"; error message="+error.message);    
    if(error.code == 4){
    	toastMsg( getTrans("You have choosen not to turn on location accuracy",'turn_off_location') );
    	checkGPS();
    } else {
    	toastMsg( error.message );
    }
}

/*function toastOnSuccess()
{
}
function toastOnError()
{
}*/

function viewTaskMap(task_id , task_lat, task_lng , delivery_address )
{
	 setStorage("task_lat", task_lat );
	 setStorage("task_lng", task_lng );
	 setStorage("delivery_address", delivery_address );
	
	 kNavigator.pushPage("Map.html", {
		  animation: 'fade',
		  callback: function(){		
		  	 viewTaskMapInit();				  	  
		  } 
	 });
}

function viewTaskMapInit()
{
	var task_lat=getStorage('task_lat');
	var task_lng=getStorage('task_lng');
	dump(task_lng);
	dump(task_lat);
		
	google_lat = new plugin.google.maps.LatLng( task_lat , task_lng );
	
	/*
    var div = document.getElementById("map_canvas");  
    map = plugin.google.maps.Map.getMap(div,{     
     'camera': {
      'latLng': google_lat,
      'zoom': 17
     }
    });      
    map.on(plugin.google.maps.event.MAP_READY, onMapInit); 
    */
	
	//$('.page__background').not('.page--menu-page__background').css('background-color', 'rgba(0,0,0,0)');
	
	setTimeout(function(){ 	    
        var div = document.getElementById("map_canvas");
        $('#map_canvas').css('height', $(window).height() - $('#map_canvas').offset().top);
        
        map = plugin.google.maps.Map.getMap(div, {     
	     'camera': {
	      'latLng': google_lat,
	      'zoom': 17
	     }
	    });
        map.setBackgroundColor('white');
        
        map.on(plugin.google.maps.event.MAP_READY, onMapInit); 
        
    }, 500); // and timeout for clear transitions        
}

function onMapInit()
{			
	/*map.clear();
	map.showDialog();*/
	map.clear();	
	var task_lat=getStorage('task_lat');
	var task_lng=getStorage('task_lng');
	var delivery_address=getStorage('delivery_address');
	
	map.addMarker({
	  'position': new plugin.google.maps.LatLng( task_lat , task_lng ),
	  'title': delivery_address ,
	  'snippet': getTrans( "Destination" ,'destination')
     }, function(marker) {
     	
	    marker.showInfoWindow();	
	    
	    navigator.geolocation.getCurrentPosition( function(position) {	    
	    	  
	    	 var driver_location = new plugin.google.maps.LatLng(position.coords.latitude , position.coords.longitude); 	
	    	 //demo
	    	 //var driver_location = new plugin.google.maps.LatLng( 34.039413 , -118.25480649999997 ); 	
	    	 
	    	 var destination = new plugin.google.maps.LatLng( task_lat , task_lng );
	    	 
	    	  map.addPolyline({
			    points: [
			      destination,
			      driver_location
			    ],
			    'color' : '#AA00FF',
			    'width': 10,
			    'geodesic': true
			   }, function(polyline) {
			   	
			   	  map.animateCamera({
					  'target': driver_location,
					  'zoom': 17,
					  'tilt': 30
					}, function() {
						
					   var data = [      
				          {'title': getTrans('You are here','you_are_here'), 'position': driver_location }  
				       ];
				   
					   addMarkers(data, function(markers) {
					    markers[markers.length - 1].showInfoWindow();
					   });
						
				   });  
				   
			   });   
	    	 // end position success
	    	 
	      }, function(error){
	    	 toastMsg( error.message );
	    	 // end position error
	      }, 
          { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
        );	    	  
    });     
}

function addMarkers(data, callback) {
  var markers = [];
  function onMarkerAdded(marker) {
    markers.push(marker);
    if (markers.length === data.length) {
      callback(markers);
    }
  }
  data.forEach(function(markerOptions) {
    map.addMarker(markerOptions, onMarkerAdded);
  });
}

function viewTaskDirection()
{	
	/*plugin.google.maps.external.launchNavigation({
	  "from": "Tokyo, Japan",
	   "to": "Kyoto, Japan"
	});*/	
		
   /*var delivery_address=getStorage('delivery_address');
   dump(delivery_address);*/
   
   var task_lat=getStorage('task_lat');
   var task_lng=getStorage('task_lng');
	
   navigator.geolocation.getCurrentPosition( function(position) {	    
   	         
         var yourLocation = new plugin.google.maps.LatLng(position.coords.latitude , position.coords.longitude); 	        
         //demo
         //var yourLocation = new plugin.google.maps.LatLng(34.039413 , -118.25480649999997); 	        
         
         var destination_location = new plugin.google.maps.LatLng(task_lat , task_lng); 	        
         
         plugin.google.maps.external.launchNavigation({
	         "from": yourLocation,
	         "to": destination_location
	      });	

    	 // end position success    	 
      }, function(error){
    	 toastMsg( error.message );
    	 // end position error
      }, 
      { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
    );	    	  		
}

function clearPushCount()
{
	removeStorage("push_count");
	$(".baloon-notification").html('');
	$(".baloon-notification").hide();
}

function playNotification()
{
	 //var sound_url= getStorage("notification_sound_url");
	 var sound_url= "file:///android_asset/www/audio/fb-alert.mp3";
	 dump(sound_url);
	 if(!empty(sound_url)){
        playAudio(sound_url);
	 }
}

var my_media;

function playAudio(url) {
    // Play the audio file at url    
    my_media = new Media(url,
        // success callback
        function () {
            dump("playAudio():Audio Success");
            my_media.stop();
            my_media.release();
        },
        // error callback
        function (err) {
            dump("playAudio():Audio Error: " + err);
        }
    );
    // Play audio
    my_media.play();
}

function stopNotification()
{
	my_media.stop();
    my_media.release();
}

function AjaxNotification(action, params , done)
{
	dump('AjaxNotification');
	if ( !hasConnection() ){
		toastMsg( getTrans("Not connected to internet","no_connection") );
		done();
		return;
	}

	params+="&lang_id="+getStorage("kr_lang_id");
	if(!empty(krms_driver_config.APIHasKey)){
		params+="&api_key="+krms_driver_config.APIHasKey;
	}		
	if ( !empty( getStorage("kr_token") )){		
		params+="&token="+  getStorage("kr_token");
	}
	
	dump(ajax_url+"/"+action+"?"+params);
	
	ajax_request3 = $.ajax({
		url: ajax_url+"/"+action, 
		data: params,
		type: 'post',                  
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
		 beforeSend: function() {
			if(ajax_request != null) {			 				   
	           ajax_request3.abort();
			} else {    
			}
		},
		complete: function(data) {					
			//ajax_request3=null;   	     							
			ajax_request3 = (function () { return; })();    
		},
		success: function (data) {	
			dump(data);
			done();
			if ( data.code==1){		
				$("#notifications-details").html( formatNotifications( data.details ) );		
			} else {		
				$("#notifications-details").html('');	
				toastMsg( data.msg );		   					
			}
		},
		error: function (request,error) {	  		    
			done();
		}
	});
	
}

function getLocationAccuracy()
{
	var location_accuracy = getStorage("kr_location_accuracy");
	if(!empty(location_accuracy)){
		if ( location_accuracy == 1){
			return true;
		}
	}
	return false;
}