var apple = require('cloud/iapVerify/apple.js');
var google = require('cloud/iapVerify/google_play.js');

// Checks against the appropriate app store
// Parameters:
// service = string name of service to check against
// paymentData = JSON data for purchase to verify
// key = 'iapReceipt', string = platform specific receipt
// key = 'iapProductId', string = purchased product ID
// key = 'iapPackageName', string = application package name
// 
// Returns a Promise w/ JSON result
// SUCCESS - status = 0, receipt information passed verification
// { 	'status':0,
//	 'productId':'1234',
//	   'receipt':{receipt_data} 
// }
// FAILURES
// - unsupported / unkown verification service
// {	'status':-1,
//	'extraError':'Invalid Service' 
// }
// - various other errors
// {	'status':123,
//	  extraError:'informational string'
// }
exports.verifyPurchase = function(service,data) {
	if (service.localeCompare("apple") == 0) {
		return apple.verifyPurchase(data);
	}
	else if (service.localeCompare("google") == 0){
		return google.verifyPurchase(data);
	}
	else {
		return Parse.Promise.error({'status':-1,'extraError':'Invalid Service'});
	}
}
