'use strict';

// include our application paths
var paths = require('./paths');

// require the beautifier library
var soften = require('gulp-soften');

// include stream combiner for easier stream manipulation
var combine = require('stream-combiner');

// our base object
var beauty = {};

beauty.init = function init(gulp, tasks){
    // save references for later access
    beauty.gulp = gulp;
    beauty.tasks = tasks;

    beauty.setupTasks();
};

beauty.setupTasks = function setupTasks(){
    // just a shortcut reference
    var tasks = beauty.tasks;

    // assign our publicly accessible methods
    tasks.jsBeautify = beauty.all;
};

// this is our task runner
beauty.run = function(src, dest){
    var combined = combine(
        beauty.gulp.src(src),
        soften(4),
        beauty.gulp.dest(dest)
    );

    combined.on('error', beauty.gulp.errorHandler);
};

// this is just a shortcut method to make it easy to beautify all javascript files at once
beauty.all = function all(){
    beauty.build();
    beauty.server();
    beauty.cli();
    beauty.client();
    beauty.deploy();
    beauty.monitor();
    beauty.scaffold();
    beauty.tests();
    beauty.workers();
};

beauty.build = function build(){
    beauty.run(paths.jsBuild, paths.build);
};

beauty.server = function(){
    beauty.run(paths.jsServer, paths.server);
};

beauty.cli = function cli(){
    beauty.run(paths.jsCLI, paths.cli);
};

beauty.client = function client(){
    beauty.run(paths.jsClient, paths.client);
};


beauty.deploy = function deploy(){
    beauty.run(paths.jsDeploy, paths.deploy);
};

beauty.monitor = function monitor(){
    beauty.run(paths.jsMonitor, paths.monitor);
};

beauty.scaffold = function scaffold(){
    beauty.run(paths.jsScaffold, paths.scaffold);
};

beauty.tests = function tests(){
    beauty.run(paths.jsTests, paths.tests);
};

beauty.workers = function workers(){
    beauty.run(paths.jsWorkers, paths.workers);
};

module.exports = beauty;