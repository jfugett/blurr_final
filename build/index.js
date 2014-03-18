'use strict';

// this is just our base object
var builder = {};

builder.extendGulp = function extendGulp(){
    // just a shortcut reference
    var gulp = builder.gulp;
    
    // include the needed libraries for growl notifications
    var growlerApp = require('./growlerApp');
    
    // include a shorthand reporter function to make things easy on us
    var reporterFunction = require('./reporterFunction')(growlerApp);
    
    // include our master key checker onto the primary gulp object so we can access it anywhere we need it
    gulp.isMaster = require('./master');
    
    // setup our default error handler
    gulp.errorHandler = require('./errorHandler')(reporterFunction, true);
    
    // setup our watch error handler that won't die on errors
    gulp.watchErrorHandler = require('./errorHandler')(reporterFunction, false);
    
    // setup a notification handler to avoid repitition
    gulp.notifyHandler = require('./notifyHandler')(reporterFunction);
    
    // setup a default exec callback so we don't have to type the same thing over and over
    gulp.execCB = require('./standardCallbacks').init(builder.gulp).exec;
    
    // setup a default callback so we don't have to type the same thing over and over
    gulp.baseCB = require('./standardCallbacks').init(builder.gulp).standard;
};

// this method is the primary runner
builder.init = function init(gulp){
    // keep a reference to gulp
    builder.gulp = gulp;
    
    // create an object to store tasks in
    builder.tasks = {};
    
    // extend gulp with some of our own objects and methods
    builder.extendGulp();
    
    // setup our base tasks
    builder.setupTasks();
    
    // setup any tasks that need to be included from our modules
    builder.includeTasks();
    
    // return the tasks so that they can be used externally
    return builder.tasks;
};

// this method sets up our main tasks that we'll be running
builder.setupTasks = function setupTasks(){
    // just a shorthand reference
    var tasks = builder.tasks;
    
    // assign the default task to dev
    tasks.default = builder.dev;
    
    // create the development task
    tasks.dev = builder.dev;
    
    // create the test task
    tasks.test = builder.test;
    
    // create the build task
    tasks.build = builder.build;
};

// this method is responsible for calling in tasks defined in other files
builder.includeTasks = function includeTasks(){
    // just shortcut references
    var gulp = builder.gulp;
    var tasks = builder.tasks;
    
    // include our help tasks
    require('./help').init(gulp, tasks);
    
    // include our git tasks
    require('./git').init(gulp, tasks);
    
    // include our version bumping tasks
    require('./bump').init(gulp, tasks);
    
    // include our jshint tasks
    require('./jsHint').init(gulp, tasks);
};

// this is the development method that defines our default development workflow
builder.dev = function dev(){
    // just a shorthand reference
    var gulp = builder.gulp;
    
    // let the user know that we're starting up the environment
    gulp.notifyHandler('Firing Development Environment Up', 'Please be patient we\'ll have you up and running in no time');

    console.log('Development Tasks Will Be Called Here');

    // let the user know that we're now running
    gulp.notifyHandler('Development Environment Running', 'We\'ll keep an eye on things so sit back, relax, and do what you do');
};

// this is the test method that runs all of our tests
builder.test = function test(){
    // just a shorthand reference
    var gulp = builder.gulp

    // let the user know that we're running the tests    
    gulp.notifyHandler('Running Tests', 'We\'re running the tests to make sure nothing broke please bear with us');

    gulp.start('jsHint');

    // let the user know that the tests have completed successfully
    gulp.notifyHandler('Tests Finished Running', 'The tests have completed successfully');
};

// this is our build method that creates the actual build from our source files
builder.build = function build(){
    // just a shorthand reference
    var gulp = builder.gulp;
    
    // let the user know that the build process has started
    gulp.notifyHandler('Building Application Files', 'We\'re building the application files please bear with us');

    // let the user know that the build is finished
    gulp.notifyHandler('Build Complete', 'The application is now built');

    // let the user know that the post build tests have finished and the application is ready to go
    gulp.notifyHandler('Ready to Run', 'The application passed the final tests and is ready to run');
};

// export our object
module.exports = builder;