'use strict';

// this is just a generator to allow injection of the needed dependencies
var generator = function generator(gulp, growlerApp){

    // this is our register function that will setup an individual notification
    var reporterFunction = function reporterFunction(notificationOptions, callback){
        // register the notification with our growler application
        growlerApp.register(function registerFunction(success, err){
            // ignore errors here since we don't want to fail when growler isn't available
            if(!success || err){
                return callback(null, success);
            }

            // Rename 'message' property to 'text' just so it's a little easier to use
            notificationOptions.text = notificationOptions.message;
            delete notificationOptions.message;

            if(gulp.config.showNotifications){
                // here we send the actual notification
                growlerApp.sendNotification('Blurr', notificationOptions,
                    function sendNotificationCallback(success, err) {
                        return callback(err, success);
                    });
            } else {
                callback(null, true);
            }

        });
    };

    // return the function so that it can be used by individual notification types
    return reporterFunction;
};

// export our generator
module.exports = generator;