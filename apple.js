
var apiUrls = {
	sandbox: 'https://sandbox.itunes.apple.com/verifyReceipt',
	production: 'https://buy.itunes.apple.com/verifyReceipt'
};

var responses = {
	'21000': 'The App Store could not read the JSON object you provided.',
	'21002': 'The data in the receipt-data property was malformed or missing.',
	'21003': 'The receipt could not be authenticated.',
	'21004': 'The shared secret you provided does not match the shared secret on file for your account.',
	'21005': 'The receipt server is not currently available.',
	'21006': 'This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.',
	'21007': 'This receipt is from the test environment, but it was sent to the production service for verification. Send it to the test environment service instead.',
	'21008': 'This receipt is from the production receipt, but it was sent to the test environment service for verification. Send it to the production environment service instead.'
};

// Dictionary parameters passed in via 'data'
// key = "iapReceipt", string = base64 transaction receipt from Apple
// key = "iapProductId", string = purchased product ID
// key = "iapPackageName", string = application package name
exports.verifyPurchase = function(data) {
  var myPromise = new Parse.Promise();

  verifyWith(production,data).then(function(httpResponse) {
  	if (httpResponse.status == 21007) {
  	  // check against the test environment
  	  return verifyWith(sandbox,data);
  	}
  	else {
      // completed verification on the production environment
      return Parse.Promise.as(httpResponse);
  	}

  }).then(function(httpResponse) {
    myPromise.resolve(httpResponse);

  },function(error) {
  	myPromise.reject(error);
  });

  return myPromise;
}

function verifyWith(uri,data) {
  var myPromise = new Parse.Promise();

  var dataPacket = {
	   method:'POST',
        url:uri,
	  headers: {'Content-Type':'application/json;charset=utf-8'},
  	   body:{'receipt-data': data.iapReceipt}
  };

  Parse.Cloud.httpRequest(dataPacket).then(function(httpResponse) {
    if (httpResponse.status == 200) {
      // now we need to check the unencrypted receipt
      var response = JSON.parse(httpResponse.text);
      var receipt = response.receipt;                   // receipt for the transaction

      // status = 0 -> validated
      if (response.status == 0) {
        var result = {'status':response.status,'productId':data.iapProductId,'receipt':receipt};
        // do some extra checks if the status = 0 (validated)
        if (!receipt) {
          result['status'] = 21003;
          result['extraError'] = responses[21003];
        }
        else {
          if (receipt.bundle_id.localeCompare(data.iapPackageName) != 0) {
            result['status'] = -3;
            result['extraError'] = 'Incorrect bundle ID returned in the receipt';
          }
          if (receipt.product_id.localeCompare(data.iapProductId) != 0) {
            result['status'] = -4;
            result['extraError'] = 'Incorrect Product ID returned in the receipt';
          }
        }
        // return the result
        myPromise.resolve(result);
      }
      else {
        // response was != 0, thus it failed verification via Apple
        var desc = (responses[response.status] != undefined) ? responses[response.status] : 'Unknown status code';
        myPromise.resolve({'status':httpResponse.status,'extraError':desc});
      }
    }
    else {
      var desc = (responses[httpResponse.status] != undefined) ? responses[httpResponse.status] : 'Unknown status code';
      myPromise.resolve({'status':httpResponse.status,'extraError':desc});
    }

  },function(error) {
    myPromise.reject({'status':httpResponse.status,'extraError':httpResponse.text});
  });

  return myPromise;
}
