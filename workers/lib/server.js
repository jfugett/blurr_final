'use strict';

var express = require('express');
var app = express();

app.get('/', function(req, res){
    res.send('Worker Server');
});

app.init = function init(){
    app.listen(80);
};

module.exports = app;