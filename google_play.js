// URIs of the various pages hit during the verification process
var refreshURI = "https://accounts.google.com/o/oauth2/token"
var validateURIBase = "https://www.googleapis.com/androidpublisher/v2/applications/"

// Dictionary parameters passed in via 'data'
// key = "iapReceipt", string = receipt token from Google Play store
// key = "iapProductId", string = purchased product ID
// key = "iapPackageName", string = application package name
exports.verifyPurchase = function(data) {
  var myPromise = new Parse.Promise();

  // get our configuration values for Google Play authentication from Parse.Config
  Parse.Config.get().then(function(config) {
    var configData = config.get('googlePlayAuth');
    var webClientID = configData['clientID'];
    var webClientSecret = configData['clientSecret'];
    var refreshToken = configData['refreshToken'];

    if (configData === undefined) {
      return Parse.Promise.error({'status':-2,'extraError':'Google Authentication data required in Parse.Config'})
    }
    else {
      // Now make a call to obtain an access_token
      return Parse.Cloud.httpRequest({
              method: 'POST',
              url: refreshURI,
              body: {
                client_id: webClientID,
                client_secret:webClientSecret,
                refresh_token:refreshToken,
                grant_type:'refresh_token'
              }
            });
    }

  }).then(function(httpResponse) {
  	// expected response
  	// {
  	//   "access_token" : "ya29.bgFhONrQLjNAMAr_IyvTwntF-JQViJbdMb7PgT2V1uHLWLx2o",		// token to use for validation API call
  	//   "token_type" : "Bearer",
  	//   "expires_in" : 3600						// Time [s] until the access_token expires
  	// }
  	var respData = JSON.parse(httpResponse.text);
  	var access_token = respData.access_token;
  	if (httpResponse.status != 200 || access_token === undefined) {
  	  return Parse.Promise.error({'status':httpResponse.status,'extraError':'G-Play verify step 1 Failed: ' + httpResponse.text});	
  	}

  	// build our URL, first the base url and then add the parameter of the access_token
    var subOrPurch = (data.subscription === undefined) ? "/purchases/products/" : "/purchases/subscriptions/";
  	var validateURL = validateURIBase + data.iapPackageName + subOrPurch + data.iapProductId + "/tokens/" + data.iapReceipt;
  	validateURL += "?access_token=" + access_token;

  	// now call Google for the final verification with a GET http request using the above created URL
  	return Parse.Cloud.httpRequest({
      			url: validateURL,
      			headers: {'Content-Type': 'application/json;charset=utf-8'}
 			    });

  }).then(function(httpResponse) {
  	// expected response
  	// {
  	//	 "kind": "androidpublisher#productPurchase",// This kind represents an inappPurchase
  	//	 "purchaseTimeMillis": "1453141119142",			// The time the product was purchased
  	//	 "purchaseState": 0,							          // 0 - Purchased, 1 - cancelled
  	//	 "consumptionState": 1,							        // 0 - Yet to be consumed, 1 - Consumed
  	// 	 "developerPayload": "DsSoYQef1tI0MGni8l01kQMhBWi5xwit680nuMumhOy9XV4iKz"	// A developer-specified string that contains supplemental information about an order
  	// }
  	var respData = JSON.parse(httpResponse.text);	// package up the response
  	if (httpResponse.status != 200) {
  	  myPromise.resolve({'status':httpResponse.status,'extraError':'G-Play verify step 2 Failed: ' + httpResponse.text});	
  	}
    else {
  	  // if we made it here, we were successful
  	  myPromise.resolve({'status':0,'productId':data.iapProductId,'receipt':respData});
    }

  },function(error) {
  	// we either have an error from httpRequest or 
  	// a created error based on the results of a request
  	var errorPackage = error;
  	if (error.extraError === undefined) {
  	  // this is an httpRequest error, so format it for what we expect
      errorPackage = {'status':error.status,'extraError':error.text};
  	}
    myPromise.resolve(errorPackage);

  });

  return myPromise;
}
