'use strict';

// just a wrapper to allow the passing of needed dependencies
// rethrow just tells us whether to rethrow the error or not
var generator = function generator(reporterFunction, reThrow){
    var errorHandler = function errorHandler(error){

        if(error.message){
            error = error.message;
        }

        // log the error message here
        console.log(error);

        // this sets up the notification content
        var options = {
            title: 'UH OH!',
            message: 'Error: ' + error
        };

        reporterFunction(options, function reporterFunctionCallback(){
            if(reThrow){
                // kill the running process with the proper exit code for travis-ci
                process.exit(1);
            } else {
                // don't rethrow the error (only used by watch tasks or tasks that we don't mind failing)
                return true;
            }

        });
    };

    // return our error handler so it can be passed into our gulp modules
    return errorHandler;
};

// return the generator so that the dependencies can be passed in
module.exports = generator;