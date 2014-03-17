'use strict';

// this is just our base object
var builder = {};

// this method is the primary runner
builder.init = function init(gulp){
    // keep a reference to gulp
    builder.gulp = gulp;
    
    // create an object to store tasks in
    builder.tasks = {};
    
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
    require('./help').init(builder.gulp, builder.tasks);
};

// this is the development method that defines our default development workflow
builder.dev = function dev(){
    console.log('dev method called');
};

// this is the test method that runs all of our tests
builder.test = function test(){
    console.log('test method called');
};

// this is our build method that creates the actual build from our source files
builder.build = function build(){
    console.log('build method called');
};

// export our object
module.exports = builder;