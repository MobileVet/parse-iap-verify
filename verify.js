var apple = require('cloud/iapVerify/apple.js');
var google = require('cloud/iapVerify/google_play.js');

exports.verifyPurchase = function(service,data) {
	if (service.localeCompare("apple") == 0) {
		return apple.verifyPurchase(data);
	}
	else if (service.localeCompare("google") == 0){
		return google.verifyPurchase(data);
	}
	else {
		return Parse.Promise.error({status:"Invalid Service"});
	}
}