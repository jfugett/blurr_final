'use strict';

// this is our base object
var cb = {};

// this method just gives us acces to the gulp dependency
cb.init = function init(gulp){
    // keep a reference to gulp
    cb.gulp = gulp;
    
    // return this object so the methods can be used
    return cb;
};

cb.standard = function standard(callback){
    // create and return a function that handles the default callback that is used in so many places
    return function(err, result){
        // if there's an error use the error handler to handle output and return the error to the caller
        if(err){
            cb.gulp.errorHandler(new Error(err));
            callback(err, null);
            return;
        }

        // if it was successful call the callback method with the result
        callback(err, result);
    };
};

cb.exec = function exec(callback){
    // create and return a function that handles the default exec callback that is used in so many places
    return function(err, stdout, stderr) {
        // if there's an error call the callback with the error and stderr output
        if(err){
            callback(err, stderr);
            return;
        }
        
        // if it was successful return the stdout to the application
        callback(err, stdout);
    };
};

module.exports = cb;