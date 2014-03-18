'use strict';

// get the cryptographic module
var crypto = require('crypto');

// this is the stored hash that equates to what the master key should be
var savedHash = '98a8929f4d3f1ec5e10ffe20698f004dfa973f29f2de58f6b18a3d111e5b8a2498a2fb47daf98d088b9e4d11da0cb53c3f06b86887fb38b17201e8280cec1961';

// create a new hash object
var shasum = crypto.createHash('sha512');

// get the key from the environment
if(process.env.MASTER_KEY){
    shasum.update(process.env.MASTER_KEY);
} else {
    shasum.update('');
}

// generate the final hash
var d = shasum.digest('hex');

// this method checks to see if the two hashes match
var isMaster = function isMaster(){
    return (d === savedHash);
};

module.exports = isMaster;