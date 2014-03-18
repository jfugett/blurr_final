'use strict';

// include the gulp jshint task
var jshint = require('gulp-jshint');

// include the styling for jshint
var stylish = require('jshint-stylish');

// include our custom reporter so we can output the results to a file
var reporter = require('./jsHintReporter');

// include stream combiner so we can control stream dependencies and errors better
var combine = require('stream-combiner');

// include our application paths
var paths = require('./paths.js');

// define our base object
var linter = {};

linter.init = function init(gulp, tasks){
    // assign references so we have access to them
    linter.gulp = gulp;
    linter.tasks = tasks;
    
    // setup the tasks for this object
    linter.setupTasks();
};

linter.setupTasks = function setupTasks(){
    // just a shortcut reference
    var tasks = linter.tasks;
    
    // setup our publicly accessible tasks
    tasks.jsHint = linter.all;
};

linter.run = function run(src){
    // combine the streams simply for error handling
    var combined = combine(
        linter.gulp.src(src),
        jshint(),
        jshint.reporter(stylish),
        jshint.reporter(reporter),
        jshint.reporter('fail')
    );
        
    // attaches the errorHandler to the streams
    combined.on('error', linter.gulp.errorHandler);
};

linter.all = function all(){
    linter.build();
    linter.server();
    linter.cli();
    linter.client();
    linter.deploy();
    linter.monitor();
    linter.scaffold();
    linter.tests();
    linter.workers();
};

linter.server = function server(){
    linter.run(paths.jsServer);
};

linter.build = function build(){
    linter.run(paths.jsBuild);
};

linter.cli = function cli(){
    linter.run(paths.jsCLI);
};

linter.client = function client(){
    linter.run(paths.jsClient);
};

linter.deploy = function deploy(){
    linter.run(paths.jsDeploy);
};

linter.monitor = function monitor(){
    linter.run(paths.jsMonitor);
};

linter.scaffold = function scaffold(){
    linter.run(paths.jsScaffold);
};

linter.tests = function tests(){
    linter.run(paths.jsTests);
};

linter.workers = function workers(){
    linter.run(paths.jsWorkers);
};

// export our module
module.exports = linter;