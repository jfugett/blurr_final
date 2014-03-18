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
    
    tasks._jsHintServer = linter.server;
    tasks._jsHintBuild = linter.build;
    tasks._jsHintCLI = linter.cli;
    tasks._jsHintClient = linter.client;
    tasks._jsHintDeploy = linter.deploy;
    tasks._jsHintMonitor = linter.monitor;
    tasks._jsHintScaffold = linter.scaffold;
    tasks._jsHintTests = linter.tests;
    tasks._jsHintWorkers = linter.workers;
    
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
    linter.run(paths.jsHintServer);
};

linter.build = function build(){
    linter.run(paths.jsHintBuild);
};

linter.cli = function cli(){
    linter.run(paths.jsHintCLI);
};

linter.client = function client(){
    linter.run(paths.jsHintClient);
};

linter.deploy = function deploy(){
    linter.run(paths.jsHintDeploy);
};

linter.monitor = function monitor(){
    linter.run(paths.jsHintMonitor);
};

linter.scaffold = function scaffold(){
    linter.run(paths.jsHintScaffold);
};

linter.tests = function tests(){
    linter.run(paths.jsHintTests);
};

linter.workers = function workers(){
    linter.run(paths.jsHintWorkers);
};

// export our module
module.exports = linter;