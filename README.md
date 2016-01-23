# parse-iap-verify

TLDR: Payment verification should be easy; now it is.

If you are trying to earn a living or build a product on mobile, you need to monetize it.  Many applications utilize 'In App Purchases' as the primary method of monetization.  The best way of verifying purchases is via a server to server communication with the store that the purchase was made from.

If you use Parse.com as your backend server, you can use Cloud Code to make those calls.  While some stores offer fairly straight forward verification steps, others are more convoluted and poorly documented.

This module makes it quick and easy so you don't have to reinvent the wheel for every new project (or spend days digging through documentation and trying various things), just like Parse does for standard backend db access, user login, etc.

## Setup

**Parse Project**
* parse-iap-verify cloned into **ParseCloud/cloud/iapVerify** of your project repo (submodules are nice)
* ParseCloud running Parse JavaScript SDK 1.3.0+ (to utilize Parse.Config)
* Parse.Config object named *googlePlayAuth* w/ key values for *clientID*, *clientSecret* and *refreshToken*

**Apple App Store**

* No special setup required

**Google Play Store**

1. Open a beer... this is going to take a while.
2. Create a Google API service account [Sign Up](https://developers.google.com/web/)
3. Create a new [Project](https://console.developers.google.com/project)
4. Enable [Google Play Developer API](https://console.developers.google.com/apis/library)
5. Create *Credentials* for this project (skip the automatic setup) 
  * Choose *New Credentials* button)
  * Select *OAuth Client ID*
  * Select *Web Application*
  * Fill in:  (*NOTE:* The redirect URI doesn't really matter, but a working site is nice)
    * Name
    * Authorized redirect URIs
  * Record the *Client ID* and *Client Secrect*
6. Visit the following URL in a browser: https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/androidpublisher&response_type=code&access_type=offline&redirect_uri=WEB_REDIRECT_URI&client_id=WEB_CLIENT_ID
7. Click Allow & authenticate yourself
8. Once you arrive at the redirect site, copy the URI out of the addres bar
9. Copy down the 'code' parameter value at the end of the URI ?code="1/......."
10. Retrieve a *refresh token* to use when verifying receipts (curl example follows)
  * curl -d "client_id=WEB_CLIENT_ID&client_secret=WEB_CLIENT_SECRECT&code=STEP_9_CODE&grant_type=authorization_code&redirect_uri=WEB_REDIRECT_URI" https://accounts.google.com/o/oauth2/token
11. Create Parse.Config object named *googlePlayAuth* with above *clientID*, *clientSecret* and *refreshToken*
12. Celebrate

##Usage

Only a single method is exposed to verify purchase receipts:

```javascript
var iap = require('cloud/iapVerify');

var platform = 'apple';
var payment = {
    receipt: 'receipt data',    // always required
    productId: 'abc',           // used for secondary verification
    packageName: 'my.app'       // Android only
};

iap.verifyPayment(platform, payment, function (error, response) {
    /* your code */
});
```

## References

* http://stackoverflow.com/users/794243/kalina

### Apple References

**API Reference**

* https://developer.apple.com/library/ios/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html

### Google Play References

**API Reference**

* https://developer.android.com/google/play/billing/gp-purchase-status-api.html
* https://developers.google.com/android-publisher/
* https://developers.google.com/android-publisher/api-ref/purchases/products
* https://developers.google.com/android-publisher/api-ref/purchases/products/get
* http://developer.android.com/google/play/billing/billing_testing.html
 
**Receipt Generation**

* http://developer.android.com/training/in-app-billing/preparing-iab-app.html
* http://developer.android.com/tools/publishing/app-signing.html
* http://developer.android.com/google/play/billing/api.html#managed

##Thank You
Kudos to:
[Kalina](http://stackoverflow.com/users/794243/kalina) for outlining the steps required for Android IAP verification.  Many people tried, but yours were the only ones that actually worked!

[Stackoverflow Post](http://stackoverflow.com/questions/12427479/am-i-getting-the-steps-right-for-verifying-a-users-android-in-app-subscription)

[Wizcorp](http://wizcorp.jp) for highlighting so many great IAP references and a nice API interface in their [Node-IAP module](https://github.com/Wizcorp/node-iap)

[Nick Lockwood](https://github.com/nicklockwood) for all of the amazing contributions he has shared with the community

[Parse](http://parse.com) for building such a great BaaS and making it so easy to create great mobile products with a strong server component quickly

##Contributing
Use [Github issues](https://github.com/MobileVet/parse-iap-verify/issues) to track bugs and feature requests.

## Licence

MIT 





